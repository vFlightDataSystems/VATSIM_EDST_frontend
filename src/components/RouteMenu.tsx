import React, { useEffect, useState } from "react";

import _ from "lodash";
import type { Nullable } from "types/utility-types";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { aselSelector, closeWindow, invertNumpadSelector } from "~redux/slices/appSlice";
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
import { getClearedToFixRouteFixes, getNextFix } from "~/utils/fixes";
import socket from "~socket";
import { PreferredRouteDisplay } from "components/PreferredRouteDisplay";
import clsx from "clsx";
import movableMenu from "css/movableMenu.module.scss";
import routeStyles from "css/routeMenu.module.scss";
import { MovableMenu } from "components/MovableMenu";
import { locationToPosition } from "~/utils/locationToPosition";
import { EramPositionType } from "~/types/apiTypes/ProcessEramMessageDto";

type Append = { appendOplus: boolean; appendStar: boolean };
const toggleAppendStar = (prev: Append) => ({
  appendStar: !prev.appendStar,
  appendOplus: false,
});
const toggleAppendOplus = (prev: Append) => ({
  appendStar: false,
  appendOplus: !prev.appendOplus,
});

// Format current UTC time as HHmm for coordination time segment
const getCoordinationTime = (): string => {
  const now = new Date();
  const hh = now.getUTCHours().toString().padStart(2, "0");
  const mm = now.getUTCMinutes().toString().padStart(2, "0");
  return `${hh}${mm}`;
};

export const RouteMenu = () => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const aircraftTrack = useRootSelector(aselTrackSelector);
  const [frd, setFrd] = useState<Nullable<string>>(null);
  const hubActions = useHubActions();
  const invertNumpad = useRootSelector(invertNumpadSelector);

  const adrs = useAdr(entry.aircraftId);
  const adars = useAdar(entry.aircraftId);
  const aars = useAar(entry.aircraftId);

  const formattedRoute = formatRoute(entry.route);
  const currentRouteFixes = useRouteFixes(entry.aircraftId);
  const routeFixes = useRouteFixes(entry.aircraftId);
  const [route, setRoute] = useState<string>(
    removeStringFromEnd(asel.window === "DEP" ? formattedRoute : formattedRoute.replace(/^\.+/, ""), entry.destination)
  );
  const [routeInput, setRouteInput] = useState<string>(
    asel.window === "DEP" ? entry.departure + route + entry.destination : route + entry.destination
  );
  const [trialPlan, setTrialPlan] = useState<boolean>(false);
  const [append, setAppend] = useState<Append>({ appendOplus: false, appendStar: false });

  useEffect(() => {
    if (aircraftTrack) {
      hubActions.generateFrd(aircraftTrack.location).then((val) => setFrd(val));
    }
  }, [aircraftTrack, entry.aircraftId, hubActions]);

  useEffect(() => {
    const dep = asel.window === "DEP";
    let routeStr = dep ? formattedRoute : formattedRoute.replace(/^\.+/, "");
    routeStr = removeStringFromEnd(routeStr, entry.destination);
    if (dep) setTrialPlan(false);
    setRoute(routeStr);
    setRouteInput(dep ? entry.departure + routeStr + entry.destination : routeStr + entry.destination);
  }, [asel.window, formattedRoute, entry.departure, entry.destination]);

  const getControlFlag = (): string => {
    return entry.owned ? "" : "/OK";
  };

  useEffect(() => {
    if (aircraftTrack && currentRouteFixes) {
      const nextFix = getNextFix(currentRouteFixes, locationToPosition(aircraftTrack.location));
      if (nextFix) {
        // Split on dots but preserve procedure names
        const originalRouteParts = route.split(".").filter((part) => {
          // Only filter out FRD patterns (12 chars, ends in 6 digits)
          const isFrd = /^[A-Z0-9]{6}\d{6}$/.test(part);
          return !isFrd;
        });

        const startSegmentIndex = originalRouteParts.findIndex((part) => part.includes(nextFix.name));

        // Make sure we found a valid segment
        if (startSegmentIndex !== -1) {
          const futureRoute = originalRouteParts.slice(startSegmentIndex).join(".");

          setRouteInput(asel.window === "DEP" ? `${entry.departure}.${futureRoute}.${entry.destination}` : `${futureRoute}.${entry.destination}`);
        }
      }
    }
  }, [aircraftTrack, currentRouteFixes, route, asel.window, entry.departure, entry.destination]);

  const buildCommandString = (cid: string, fix: string, routeStr: string, destination: string): string => {
    const controlFlag = trialPlan ? "/OK" : getControlFlag();
    const timeSegment = trialPlan ? "" : ` 07 ${getCoordinationTime()}`;
    let suffix = "";
    if (append.appendStar) {
      suffix = "*";
    } else if (append.appendOplus) {
      suffix = OPLUS_SYMBOL;
    }
    return `AM ${cid}${controlFlag} 06 ${fix}${timeSegment} 10 ${routeStr}${destination}${suffix}`;
  };

  const amendPrefroute = async (amendedFlightplan: CreateOrAmendFlightplanDto) => {
    if (!trialPlan) {
      await hubActions.amendFlightplan(amendedFlightplan);
    } else {
      const routeStr = formatRoute(amendedFlightplan.route, entry.departure, entry.destination);
      const cmd = buildCommandString(entry.cid, frd || "", routeStr, amendedFlightplan.destination);
      dispatch(
        addPlanThunk({
          cid: entry.cid,
          aircraftId: entry.aircraftId,
          amendedFlightplan,
          commandString: cmd,
          expirationTime: Date.now() / 1000 + 120,
        })
      );
    }
  };

  const getEditableRoute = (): string => {
    if (asel.window === "DEP") {
      return entry.departure + route + entry.destination;
    }

    if (!aircraftTrack || !currentRouteFixes) {
      return route + entry.destination;
    }

    const nextFix = getNextFix(currentRouteFixes, locationToPosition(aircraftTrack.location));
    if (!nextFix) {
      return route + entry.destination;
    }

    // Find the segment containing the next fix
    const originalRouteParts = route.split(".");

    // Find which part of the original route contains our next fix
    const startSegmentIndex = originalRouteParts.findIndex((part) => part.includes(nextFix.name));

    // Take all segments from that point forward
    const futureRoute = originalRouteParts.slice(startSegmentIndex).join(".");

    return futureRoute + entry.destination;
  };

  const clearedToFix = async (fixName: string) => {
    const suffix = append.appendStar ? "*" : append.appendOplus ? OPLUS_SYMBOL : "";
    if (!trialPlan) {
      const message = {
        source: EramPositionType.DSide,
        elements: [{ token: "QU" }, { token: fixName + suffix }, { token: entry.cid }],
        invertNumericKeypad: invertNumpad,
      };
      await hubActions.sendEramMessage(message);
    } else {
      const info = getClearedToFixRouteFixes(fixName, entry, currentRouteFixes, formattedRoute, frd || "");
      if (info?.route) {
        const routeStr = info.route;
        const amendedFlightplan: ApiFlightplan = {
          ...entry,
          route: routeStr.split(/\.+/g).join(" ").trim(),
        };
        const cmd = buildCommandString(entry.cid, frd || "", routeStr, amendedFlightplan.destination);
        dispatch(
          addPlanThunk({
            cid: entry.cid,
            aircraftId: entry.aircraftId,
            amendedFlightplan,
            commandString: cmd,
            expirationTime: Date.now() / 1000 + 120,
          })
        );
      }
    }
    dispatch(closeWindow("ROUTE_MENU"));
  };

  const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (event) => {
    if (event.key === "Enter") {
      const fix = frd || "";
      let newRoute = removeStringFromEnd(routeInput, entry.destination);
      if (asel.window === "DEP") {
        newRoute = removeStringFromStart(newRoute, entry.departure);
      } else {
        newRoute = `${fix}..${newRoute.replace(/^\.+/, "")}`;
      }
      const cleaned = newRoute.toUpperCase().replace(/^\.+/, "").trim();
      const amendedFlightplan = { ...entry, route: cleaned };
      if (trialPlan) {
        const cmd = buildCommandString(entry.cid, fix, cleaned, amendedFlightplan.destination);
        dispatch(
          addPlanThunk({
            cid: entry.cid,
            aircraftId: entry.aircraftId,
            amendedFlightplan,
            commandString: cmd,
            expirationTime: Date.now() / 1000 + 120,
          })
        );
      } else {
        await hubActions.amendFlightplan(amendedFlightplan);
      }
      dispatch(closeWindow("ROUTE_MENU"));
    }
  };

  const handleClearedPrefroute = async (prefRoute: EdstAdaptedRoute) => {
    const amendedFlightplan: CreateOrAmendFlightplanDto = {
      ...entry,
      route: prefRoute.routeGroups.join(" "),
    };

    await amendPrefroute(amendedFlightplan);
    dispatch(closeWindow("ROUTE_MENU"));
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
          {!(asel.window === "DEP") && (
            <div className={movableMenu.button} onMouseDown={() => dispatch(openMenuThunk("HOLD_MENU"))}>
              HOLD DATA
            </div>
          )}
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
            className={clsx(movableMenu.blueButton, { [movableMenu.selected]: append.appendStar })}
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuClickAppendStar");
              setAppend(toggleAppendStar);
            }}
          >
            APPEND *
          </div>
          <div
            className={clsx(movableMenu.blueButton, { [movableMenu.selected]: append.appendOplus })}
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
        aar={aars.filter((parData) => (currentRouteFixes?.map((fix) => fix.name) ?? []).includes(parData.triggeredFix)) ?? []}
        adr={asel.window === "DEP" ? adrs : []}
        adar={asel.window === "DEP" ? adars : []}
        clearedPrefroute={handleClearedPrefroute}
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
