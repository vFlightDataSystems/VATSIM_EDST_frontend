import React, { useEffect, useState } from "react";

import _ from "lodash";
import type { Nullable } from "types/utility-types";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { aselSelector, closeWindow } from "~redux/slices/appSlice";
import { aselTrackSelector } from "~redux/slices/trackSlice";
import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";
import type { EdstAdaptedRoute } from "types/edstAdaptedRoute";
import { addPlanThunk } from "~redux/thunks/addPlanThunk";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useHubActions } from "hooks/useHubActions";
import { OPLUS_SYMBOL } from "~/utils/constants";
import type { CreateOrAmendFlightplanDto } from "types/apiTypes/CreateOrAmendFlightplanDto";
import { useAar, useAdar, useAdr } from "api/prefrouteApi";
import { useRouteFixes } from "api/aircraftApi";
import { formatRoute } from "~/utils/formatRoute";
import { useSharedUiListener } from "hooks/useSharedUiListener";
import { removeStringFromStart, removeStringFromEnd } from "~/utils/stringManipulation";
import { getClearedToFixRouteFixes } from "~/utils/fixes";
import socket from "~socket";
import { PreferredRouteDisplay } from "components/PreferredRouteDisplay";
import clsx from "clsx";
import movableMenu from "css/movableMenu.module.scss";
import routeStyles from "css/routeMenu.module.scss";
import { MovableMenu } from "components/MovableMenu";

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
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const aircraftTrack = useRootSelector(aselTrackSelector);
  const [frd, setFrd] = useState<Nullable<string>>(null);
  const hubActions = useHubActions();

  const adrs = useAdr(entry.aircraftId);
  const adars = useAdar(entry.aircraftId);
  const aars = useAar(entry.aircraftId);

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

  let routesAvailable = aars.length > 0;
  if (asel.window === "DEP") {
    routesAvailable = routesAvailable || adrs.length > 0 || adars.length > 0;
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

  const clearedPrefroute = async (prefRoute: EdstAdaptedRoute) => {
    let amendedFlightplan: CreateOrAmendFlightplanDto;
    if (prefRoute.routeType === "adar") {
      amendedFlightplan = { ...entry, route: prefRoute.route.split(/\.+/).join(" ") };
      await amendPrefroute(amendedFlightplan);
    } else if (prefRoute.routeType === "adr") {
      amendedFlightplan = {
        ...entry,
        route: [...new Set(prefRoute.amendment.split(/\.+/).concat(prefRoute.truncatedRoute.split(/\.+/)))].join(" "),
      };
      await amendPrefroute(amendedFlightplan);
    } else if (prefRoute.routeType === "aar") {
      amendedFlightplan = {
        ...entry,
        route: prefRoute.truncatedRoute.split(/\.+/).concat(prefRoute.amendment.split(/\.+/)).join(" "),
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
    <MovableMenu
      menuName="ROUTE_MENU"
      centerCursorDeps={[entry.aircraftId]}
      rootClassName={routeStyles.root}
      title={`Route Menu ${entry.aircraftId}`}
    >
      <div className={movableMenu.row}>
        <div className={clsx(movableMenu.col, "left")}>
          <div
            className={clsx(movableMenu.button, { [movableMenu.selected]: trialPlan, isDisabled: asel.window === "DEP" })}
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuSetTrialPlan", true);
              setTrialPlan(true);
            }}
          >
            TRIAL PLAN
          </div>
          <div
            className={clsx(movableMenu.button, { [movableMenu.selected]: !trialPlan })}
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuSetTrialPlan", false);
              setTrialPlan(false);
            }}
          >
            AMEND
          </div>
        </div>
        <div className={clsx(movableMenu.col, "right")}>
          {/* <div className={clsx(movableMenu.button, "isDisabled")}>UPLINK</div> */}
          {/* <div className={clsx(movableMenu.button, "isDisabled")}>{DOWNLINK_SYMBOL}</div> */}
          {/* <div className={clsx(movableMenu.button, "isDisabled")}>CAR</div> */}
          {/* <div className={clsx(movableMenu.button, "isDisabled")}>X RES</div> */}
          <div className={movableMenu.button} onMouseDown={() => dispatch(openMenuThunk("HOLD_MENU"))}>
            HOLD DATA
          </div>
        </div>
      </div>
      <div className={movableMenu.row} />
      <div className={movableMenu.row}>
        <div className={movableMenu.segmentHeader}>CURRENT RTE EDIT AREA</div>
      </div>
      <div className={routeStyles.inputContainer}>
        {!(asel.window === "DEP") && <div className={routeStyles.ppos}>{frd}..</div>}
        <input value={routeInput} spellCheck={false} onChange={(event) => setRouteInput(event.target.value)} onKeyDown={handleInputKeyDown} />
      </div>
      <div className={movableMenu.row} />
      <div className={clsx(movableMenu.row, "topBorder")}>
        <div className={clsx(movableMenu.col, "left")}>
          <div className={clsx(movableMenu.blueButton, "isDisabled")}>INCLUDE PAR</div>
          <div
            className={clsx(movableMenu.blueButton, { [movableMenu.selected]: appendStar })}
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuClickAppendStar");
              setAppend(toggleAppendStar);
            }}
          >
            APPEND *
          </div>
          <div
            className={clsx(movableMenu.blueButton, { [movableMenu.selected]: appendOplus })}
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuClickAppendOplus");
              setAppend(toggleAppendOplus);
            }}
          >
            Append {OPLUS_SYMBOL}
          </div>
        </div>
      </div>
      <div className={movableMenu.row} />
      <div className={movableMenu.segmentHeader}>DIRECT-TO-FIX</div>
      <div className={routeStyles.row}>
        <div className={routeStyles.route}>
          {asel.window === "DEP" ? entry.departure + route + entry.destination : `${route}${entry.destination}`}
        </div>
      </div>
      {_.range(0, Math.min(routeFixes?.length ?? 0, 10)).map((i) => (
        <div className={routeStyles.row} key={i}>
          {_.range(0, Math.round((routeFixes?.length ?? 0) / 10) + 1).map((j) => {
            const fixName = routeFixes?.[i + j * 10]?.name;
            return (
              fixName && (
                <div className={routeStyles.dct} key={`${i}-${j}`} onMouseDown={() => clearedToFix(fixName)}>
                  {fixName}
                </div>
              )
            );
          })}
        </div>
      ))}
      <div className={movableMenu.segmentHeader}>APR</div>
      <PreferredRouteDisplay
        aar={aars.filter((parData) => currentRouteFixNames.includes(parData.triggeredFix)) ?? []}
        adr={asel.window === "DEP" ? adrs : []}
        adar={asel.window === "DEP" ? adars : []}
        clearedPrefroute={clearedPrefroute}
      />
      <div className={clsx(movableMenu.row, "topBorder")}>
        <div className={clsx(movableMenu.col, "right")}>
          <div className={clsx(movableMenu.blueButton, "isDisabled")}>FLIGHT DATA</div>
          <div
            className={clsx(movableMenu.blueButton, "isDisabled")}
            onMouseDown={() => {
              dispatch(openMenuThunk("PREV_ROUTE_MENU", null, false, true));
              dispatch(closeWindow("ROUTE_MENU"));
            }}
          >
            PREVIOUS ROUTE
          </div>
          <div className={clsx(movableMenu.blackButton, "isDisabled")}>TFM REROUTE MENU</div>
        </div>
      </div>
    </MovableMenu>
  );
};
