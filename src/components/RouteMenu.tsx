import React, { useEffect, useRef, useState } from "react";

import "css/styles.css";
import _ from "lodash";
import type { Nullable } from "types/utility-types";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { aselSelector, closeWindow, windowPositionSelector, pushZStack, zStackSelector } from "~redux/slices/appSlice";
import { aselTrackSelector } from "~redux/slices/trackSlice";
import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";
import type { EdstPreferentialRoute } from "types/edstPreferentialRoute";
import { addPlanThunk } from "~redux/thunks/addPlanThunk";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { useHubActions } from "hooks/useHubActions";
import { OPLUS_SYMBOL } from "~/utils/constants";
import type { CreateOrAmendFlightplanDto } from "types/apiTypes/CreateOrAmendFlightplanDto";
import { usePar, usePdar, usePdr } from "api/prefrouteApi";
import { useRouteFixes } from "api/aircraftApi";
import { formatRoute } from "~/utils/formatRoute";
import { useSharedUiListener } from "hooks/useSharedUiListener";
import { removeStringFromStart, removeStringFromEnd } from "~/utils/stringManipulation";
import { getClearedToFixRouteFixes } from "~/utils/fixes";
import socket from "~socket";
import { DownlinkSymbol } from "components/utils/DownlinkSymbol";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstTooltip } from "components/utils/EdstTooltip";
import { EdstButton, ExitButton } from "components/utils/EdstButton";
import FLIGHTAWARE_LOGO from "resources/images/FA_1.png";
import SKYVECTOR_LOGO from "resources/images/glob_bright.png";
import { PreferredRouteDisplay } from "components/PreferredRouteDisplay";
import { useFitWindowToScreen } from "hooks/useFitWindowToScreen";
import clsx from "clsx";
import optionStyles from "css/optionMenu.module.scss";
import routeStyles from "css/routeMenu.module.scss";

type Append = { appendOplus: boolean; appendStar: boolean };
const toggleAppendStar = (prev: Append) => ({
  appendStar: !prev.appendStar,
  appendOplus: false,
});
const toggleAppendOplus = (prev: Append) => ({
  appendStar: false,
  appendOplus: !prev.appendOplus,
});

export const RouteMenu = () => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRootSelector((state) => windowPositionSelector(state, "ROUTE_MENU"));
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const aircraftTrack = useRootSelector(aselTrackSelector);
  const zStack = useRootSelector(zStackSelector);
  const [frd, setFrd] = useState<Nullable<string>>(null);
  const hubActions = useHubActions();
  useFitWindowToScreen(ref, "ROUTE_MENU");
  const focused = useFocused(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "ROUTE_MENU", "mouseup");
  useCenterCursor(ref, [asel.aircraftId]);

  const pdrs = usePdr(entry.aircraftId);
  const pdars = usePdar(entry.aircraftId);
  const pars = usePar(entry.aircraftId);

  const formattedRoute = formatRoute(entry.route);
  const currentRouteFixes = useRouteFixes(entry.aircraftId);
  const [route, setRoute] = useState(
    removeStringFromEnd(asel.window === "DEP" ? formattedRoute : formattedRoute.replace(/^\.*/, "") ?? "", entry.destination)
  );
  const [routeInput, setRouteInput] = useState(asel.window === "DEP" ? entry.departure + route + entry.destination : route + entry.destination);
  const [trialPlan, setTrialPlan] = useState(!(asel.window === "DEP"));
  const [append, setAppend] = useState({
    appendOplus: false,
    appendStar: false,
  });

  useEffect(() => {
    if (aircraftTrack) {
      hubActions.generateFrd(aircraftTrack.location).then((frd) => setFrd(frd));
    }
  }, [aircraftTrack, entry.aircraftId, hubActions]);

  const { appendOplus, appendStar } = append;

  useEffect(() => {
    const dep = asel.window === "DEP";
    let route = dep ? formattedRoute : formattedRoute.replace(/^\.*/, "") ?? "";
    route = removeStringFromEnd(route ?? "", entry.destination);
    if (dep) {
      setTrialPlan(false);
    }
    setRoute(route);
    setRouteInput(dep ? entry.departure + route + entry.destination : route + entry.destination);
  }, [asel.window, formattedRoute, entry.departure, entry.destination, entry.route]);

  const currentRouteFixNames: string[] = currentRouteFixes.map((fix) => fix.name) ?? [];
  let routeFixes = currentRouteFixes;
  if (routeFixes.length > 1) {
    // if first fix is FRD
    if (routeFixes?.[0]?.name?.match(/^\w+\d{6}$/gi)) {
      routeFixes = routeFixes.slice(1);
    }
  }

  let routesAvailable = pars.length > 0;
  if (asel.window === "DEP") {
    routesAvailable = routesAvailable || pdrs.length > 0 || pdars.length > 0;
  }

  const amendPrefroute = async (amendedFlightplan: CreateOrAmendFlightplanDto) => {
    if (!trialPlan) {
      await hubActions.amendFlightplan(amendedFlightplan);
    } else {
      const route = formatRoute(amendedFlightplan.route, entry.departure, entry.destination);
      dispatch(
        addPlanThunk({
          cid: entry.cid,
          aircraftId: entry.aircraftId,
          amendedFlightplan,
          commandString: `AM ${entry.aircraftId} FIX ${frd} TIM EXX00 RTE ${route}${amendedFlightplan.destination}`,
          expirationTime: Date.now() / 1000 + 120,
        })
      );
    }
  };

  const clearedPrefroute = async (prefRoute: EdstPreferentialRoute) => {
    let amendedFlightplan: CreateOrAmendFlightplanDto;
    if (prefRoute.routeType === "pdar") {
      amendedFlightplan = { ...entry, route: prefRoute.route };
      await amendPrefroute(amendedFlightplan);
    } else if (prefRoute.routeType === "pdr") {
      amendedFlightplan = {
        ...entry,
        route: prefRoute.amendment.split(".").join(" ") + prefRoute.truncatedRoute,
      };
      await amendPrefroute(amendedFlightplan);
    } else if (prefRoute.routeType === "par") {
      amendedFlightplan = {
        ...entry,
        route: prefRoute.truncatedRoute + prefRoute.amendment.split(".").join(" "),
      };
      await amendPrefroute(amendedFlightplan);
    }
    dispatch(closeWindow("ROUTE_MENU"));
  };

  const clearedToFix = async (clearedFixName: string) => {
    const frd = aircraftTrack ? await hubActions.generateFrd(aircraftTrack.location) : null;
    const route = getClearedToFixRouteFixes(clearedFixName, entry, routeFixes, formattedRoute, frd)?.route;
    if (route) {
      const amendedFlightplan: ApiFlightplan = {
        ...entry,
        route: route.split(/\.+/g).join(" ").trim(),
      };
      if (!trialPlan) {
        await hubActions.amendFlightplan(amendedFlightplan);
      } else {
        dispatch(
          addPlanThunk({
            cid: entry.cid,
            aircraftId: entry.aircraftId,
            amendedFlightplan,
            commandString: `AM ${entry.aircraftId} FIX ${frd} TIM EXX00 RTE ${route}${amendedFlightplan.destination}`,
            expirationTime: Date.now() / 1000 + 120,
          })
        );
      }
    }
    dispatch(closeWindow("ROUTE_MENU"));
  };

  const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (event) => {
    event.persist();
    if (event.key === "Enter") {
      const frd = aircraftTrack ? await hubActions.generateFrd(aircraftTrack.location) : null;
      let newRoute = removeStringFromEnd(routeInput, entry.destination);
      if (asel.window === "DEP") {
        newRoute = removeStringFromStart(newRoute, entry.departure);
      } else {
        newRoute = `${frd}..${newRoute.replace(/^\.+/g, "")}`;
      }
      const amendedFlightplan = {
        ...entry,
        route: newRoute.toUpperCase().replace(/^\.+/gi, "").trim(),
      };
      if (trialPlan) {
        dispatch(
          addPlanThunk({
            cid: entry.cid,
            aircraftId: entry.aircraftId,
            amendedFlightplan,
            commandString: `AM ${entry.aircraftId} FIX ${frd} TIM EXX00 RTE ${newRoute}${amendedFlightplan.destination}`,
            expirationTime: Date.now() / 1000 + 120,
          })
        );
      } else {
        await hubActions.amendFlightplan(amendedFlightplan);
      }
      dispatch(closeWindow("ROUTE_MENU"));
    }
  };

  useSharedUiListener("routeMenuSetTrialPlan", setTrialPlan);
  useSharedUiListener("routeMenuClickAppendStar", setAppend, toggleAppendStar);
  useSharedUiListener("routeMenuClickAppendOplus", setAppend, toggleAppendOplus);

  return (
    <div
      className={clsx(routeStyles.root, { noPointerEvents: anyDragging })}
      ref={ref}
      style={{ ...pos, zIndex: 10000 + zStack.indexOf("ROUTE_MENU") }}
      onMouseDown={() => zStack.indexOf("ROUTE_MENU") < zStack.length - 1 && dispatch(pushZStack("ROUTE_MENU"))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        Route Menu
      </div>
      <div className={optionStyles.body}>
        <div className={routeStyles.fidRow}>
          {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
        </div>
        <div className={clsx(routeStyles.row, "pad")}>
          <div className={routeStyles.col}>
            <EdstButton
              content="Trial Plan"
              selected={trialPlan}
              onMouseDown={() => {
                socket.dispatchUiEvent("routeMenuSetTrialPlan", true);
                setTrialPlan(true);
              }}
              title={Tooltips.routeMenuPlanData}
              disabled={asel.window === "DEP"}
            />
          </div>
          <div className={routeStyles.icon}>
            <a href={`https://skyvector.com/?fpl=${entry.departure} ${entry.route} ${entry.destination}`} target="_blank" rel="noreferrer">
              <img src={SKYVECTOR_LOGO} alt="skyvector-logo" />
            </a>
          </div>
          <div className={routeStyles.icon}>
            <a
              href={`https://flightaware.com/analysis/route.rvt?origin=${entry.departure}&destination=${entry.destination}`}
              target="_blank"
              rel="noreferrer"
            >
              <img src={FLIGHTAWARE_LOGO} alt="flightaware-logo" />
            </a>
          </div>
          <div className={clsx(routeStyles.col, "right")}>
            {entry.cpdlcCapable && (
              <>
                <EdstButton content="Uplink" />
                <DownlinkSymbol />
              </>
            )}
            <EdstButton
              content="Amend"
              selected={!trialPlan}
              onMouseDown={() => {
                socket.dispatchUiEvent("routeMenuSetTrialPlan", false);
                setTrialPlan(false);
              }}
              title={Tooltips.routeMenuAmend}
            />
          </div>
        </div>
        <div className={clsx(routeStyles.row, "pad")}>
          <div className={routeStyles.col}>
            <div className={routeStyles.inputContainer}>
              {!(asel.window === "DEP") && (
                <EdstTooltip title={Tooltips.routeMenuFrd}>
                  <div className={routeStyles.ppos}>{frd}..</div>
                </EdstTooltip>
              )}
              <input value={routeInput} onChange={(event) => setRouteInput(event.target.value)} onKeyDown={(event) => handleInputKeyDown(event)} />
            </div>
          </div>
        </div>
        <div className={clsx(routeStyles.row, "pad", "topBorder")}>
          <div className={clsx(routeStyles.buttonCol, "isDisabled")} title={Tooltips.routeMenuPar}>
            <div className={clsx(routeStyles.indicator, "isDisabled", "s9")} />
            Include PAR
          </div>
        </div>
        <div className={clsx(routeStyles.row, "pad", "bottomBorder")}>
          <div
            className={clsx(routeStyles.buttonCol)}
            title={Tooltips.routeMenuAppendStar}
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuClickAppendStar");
              setAppend(toggleAppendStar);
            }}
          >
            <div className={clsx(routeStyles.indicator, "s9", { selected: appendStar })} />
            Append *
          </div>
          <div
            className={clsx(routeStyles.buttonCol)}
            title={Tooltips.routeMenuAppendOplus}
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuClickAppendOplus");
              setAppend(toggleAppendOplus);
            }}
          >
            <div className={clsx(routeStyles.indicator, "s9", { selected: appendOplus })} />
            Append {OPLUS_SYMBOL}
          </div>
        </div>
        <EdstTooltip title={Tooltips.routeMenuDirectFix}>
          <div className={routeStyles.underlineRow}>Direct-To-Fix</div>
        </EdstTooltip>
        <div className={routeStyles.row}>
          <div className={routeStyles.route}>
            {asel.window === "DEP" ? entry.departure + route + entry.destination : `./.${route}${entry.destination}`}
          </div>
        </div>
        {_.range(0, Math.min(routeFixes?.length ?? 0, 10)).map((i) => (
          <div className={routeStyles.row} key={i}>
            {_.range(0, Math.round((routeFixes?.length ?? 0) / 10) + 1).map((j) => {
              const fixName = routeFixes?.[i + j * 10]?.name;
              return (
                fixName && (
                  <div className={routeStyles.dct} key={`${i}-${j}`} onMouseDown={() => clearedToFix(fixName)} title={Tooltips.routeMenuDirectFix}>
                    {fixName}
                  </div>
                )
              );
            })}
          </div>
        ))}
        {routesAvailable && (
          <PreferredRouteDisplay
            par={pars.filter((parData) => currentRouteFixNames.includes(parData.triggeredFix)) ?? []}
            pdr={asel.window === "DEP" ? pdrs : []}
            pdar={asel.window === "DEP" ? pdars : []}
            clearedPrefroute={clearedPrefroute}
          />
        )}
        <div className={clsx(routeStyles.row, "bottomRow")}>
          <div className={routeStyles.col}>
            <EdstButton disabled margin="0 4px 0 0" content="Flight Data" title={Tooltips.routeMenuFlightData} />
            <EdstButton
              disabled={entry.previousRoute === null}
              margin="0 4px 0 0"
              content="Previous Route"
              onMouseDown={() => {
                dispatch(openMenuThunk("PREV_ROUTE_MENU", ref.current, false, true));
                dispatch(closeWindow("ROUTE_MENU"));
              }}
              title={Tooltips.routeMenuPrevRoute}
            />
            <EdstButton disabled content="TFM Reroute Menu" title={Tooltips.routeMenuTfmReroute} />
          </div>
          <div className={clsx(routeStyles.col, "right")}>
            <ExitButton onMouseDown={() => dispatch(closeWindow("ROUTE_MENU"))} />
          </div>
        </div>
      </div>
    </div>
  );
};
