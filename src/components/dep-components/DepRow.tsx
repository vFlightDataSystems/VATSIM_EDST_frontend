import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Nullable } from "types/utility-types";
import { delEntry, entrySelector, toggleSpa, updateEntry } from "~redux/slices/entrySlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aircraftIsAselSelector } from "~redux/slices/appSlice";
import { depAircraftSelect } from "~redux/thunks/aircraftSelect";
import type { EdstWindow } from "types/edstWindow";
import type { DepRowField } from "types/dep/depRowField";
import { COMPLETED_CHECKMARK_SYMBOL, REMOVAL_TIMEOUT, SPA_INDICATOR } from "~/utils/constants";
import { usePar, usePdar, usePdr } from "api/prefrouteApi";
import { useRouteFixes } from "api/aircraftApi";
import type { ApiPreferentialDepartureRoute } from "types/apiTypes/apiPreferentialDepartureRoute";
import type { ApiPreferentialDepartureArrivalRoute } from "types/apiTypes/apiPreferentialDepartureArrivalRoute";
import type { ApiPreferentialArrivalRoute } from "types/apiTypes/apiPreferentialArrivalRoute";
import { formatRoute } from "~/utils/formatRoute";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useAselEventListener } from "hooks/useAselEventListener";
import { depHiddenColumnsSelector, depManualPostingSelector } from "~redux/slices/depSlice";
import type { AircraftId } from "types/aircraftId";
import { convertBeaconCodeToString, removeStringFromEnd } from "~/utils/stringManipulation";
import depStyles from "css/dep.module.scss";
import tableStyles from "css/table.module.scss";
import clsx from "clsx";

type DepRowProps = {
  aircraftId: AircraftId;
};

const checkParReroutePending = (pars: ApiPreferentialArrivalRoute[], currentFixNames: string[]) => {
  const eligiblePar = pars.filter((par) => par.eligible);
  if (eligiblePar.length === 1) {
    const par = eligiblePar[0];
    if (currentFixNames.includes(par.triggeredFix)) {
      return par.amendment;
    }
  }
  return null;
};

const checkPdrReroutePending = (pdrs: ApiPreferentialDepartureRoute[]) => {
  if (pdrs.length === 0) {
    return null;
  }
  const eligibleRoutes = pdrs.filter((pdr) => pdr.eligible);
  if (eligibleRoutes.length > 0) {
    const eligibleRnavRoutes = eligibleRoutes.filter((pdr) => pdr.rnavRequired);
    if (eligibleRnavRoutes.length > 0) {
      return eligibleRnavRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].amendment;
    }
    return eligibleRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].amendment;
  }
  return null;
};
const checkPdarReroutePending = (pdars: ApiPreferentialDepartureArrivalRoute[]) => {
  if (pdars.length === 0) {
    return null;
  }
  const eligibleRoutes = pdars.filter((pdr) => pdr.eligible);
  if (eligibleRoutes.length > 0) {
    const eligibleRnavRoutes = eligibleRoutes.filter((pdr) => pdr.rnavRequired);
    if (eligibleRnavRoutes.length > 0) {
      return eligibleRnavRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].route;
    }
    return eligibleRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].route;
  }
  return null;
};

/**
 * Single DEP row
 */
export const DepRow = React.memo(({ aircraftId }: DepRowProps) => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const entry = useRootSelector((state) => entrySelector(state, aircraftId));
  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent);
  const asel = useRootSelector((state) => aircraftIsAselSelector(state, aircraftId));
  const manualPosting = useRootSelector(depManualPostingSelector);
  const hiddenColumns = useRootSelector(depHiddenColumnsSelector);
  const routeFixes = useRouteFixes(aircraftId);
  const currentFixNames = routeFixes.map((fix) => fix.name);
  const pdrs = usePdr(aircraftId);
  const pdars = usePdar(aircraftId);
  const pars = usePar(aircraftId);

  const formattedRoute = formatRoute(entry.route);
  const route = removeStringFromEnd(formattedRoute.slice(0), entry.destination);

  const onPar = useMemo(() => pars.filter((par) => par.eligible && formattedRoute.includes(par.amendment)).length > 0, [formattedRoute, pars]);
  const onPdr = useMemo(() => pdars.filter((pdar) => pdar.eligible && formattedRoute === pdar.route).length > 0, [formattedRoute, pdars]);
  const onPdar = useMemo(() => pdrs.filter((pdr) => route.startsWith(pdr.amendment)).length > 0, [pdrs, route]);

  useEffect(() => {
    setFreeTextContent(entry.freeTextContent);
  }, [entry.freeTextContent]);

  const pendingPdr = useMemo(() => {
    if (!onPdr) {
      return checkPdrReroutePending(pdrs);
    }
    return null;
  }, [onPdr, pdrs]);
  const pendingPdar = useMemo(() => {
    if (!onPdar) {
      return checkPdarReroutePending(pdars);
    }
    return null;
  }, [onPdar, pdars]);
  const pendingPar = useMemo(() => {
    if (!onPar) {
      return checkParReroutePending(pars, currentFixNames);
    }
    return null;
  }, [currentFixNames, onPar, pars]);

  const now = Date.now();

  const isSelected = useCallback(
    (field: DepRowField) => {
      return asel?.window === "DEP" && asel?.aircraftId === aircraftId && asel?.field === field;
    },
    [aircraftId, asel?.aircraftId, asel?.field, asel?.window]
  );

  const handleClick = useCallback(
    (element: HTMLElement, field: DepRowField, eventId: Nullable<string>, opensWindow?: EdstWindow, triggerSharedState = true) => {
      dispatch(depAircraftSelect(aircraftId, field, eventId, triggerSharedState));
      if (opensWindow && !isSelected(field)) {
        dispatch(openMenuThunk(opensWindow, element, false, false, true));
      }
    },
    [dispatch, aircraftId, isSelected]
  );
  const altRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);

  useAselEventListener(altRef, aircraftId, "dep-alt-asel", "ALT_DEP_ROW_FIELD", "ALTITUDE_MENU", handleClick);
  useAselEventListener(routeRef, aircraftId, "dep-route-asel", "ROUTE_DEP_ROW_FIELD", "ROUTE_MENU", handleClick);

  const handleHotboxMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    if (event.button === 0) {
      dispatch(updateEntry({ aircraftId, data: { showFreeText: !entry.showFreeText } }));
    }
    if (event.button === 1) {
      dispatch(toggleSpa(aircraftId));
    }
    if (event.button === 2) {
      dispatch(updateEntry({ aircraftId, data: { highlighted: !entry.highlighted } }));
    }
  };

  const updateStatus = () => {
    if (entry.depStatus === -1) {
      dispatch(updateEntry({ aircraftId, data: { depStatus: 0 } }));
    } else if (entry.depStatus < 1) {
      dispatch(updateEntry({ aircraftId, data: { depStatus: 1 } }));
    } else {
      dispatch(updateEntry({ aircraftId, data: { depStatus: 0 } }));
    }
  };

  const handleFidClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const now = Date.now();
    switch (event.button) {
      case 2:
        if (now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT) {
          dispatch(delEntry(aircraftId));
        }
        break;
      default:
        dispatch(depAircraftSelect(aircraftId, "FID_DEP_ROW_FIELD", null));
        break;
    }
  };

  const handleRemarksClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (entry.depStatus === -1 && !manualPosting) {
      dispatch(updateEntry({ aircraftId, data: { depStatus: 0 } }));
    }
    switch (event.button) {
      case 0:
        dispatch(
          updateEntry({
            aircraftId,
            data: {
              routeDisplay:
                !(entry.routeDisplay === "REMARKS_ROUTE_DISPLAY_OPTION") && entry.remarks.length > 0 ? "REMARKS_ROUTE_DISPLAY_OPTION" : null,
              remarksChecked: true,
            },
          })
        );
        break;
      case 2:
        dispatch(
          updateEntry({
            aircraftId,
            data: {
              routeDisplay: !(entry.routeDisplay === "RAW_ROUTE_DISPLAY_OPTION") ? "RAW_ROUTE_DISPLAY_OPTION" : null,
            },
          })
        );
        break;
      default:
        break;
    }
  };

  return (
    <div className={tableStyles.rowContainer}>
      <div className={clsx(tableStyles.row, { pendingRemoval: now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT })}>
        <div className={clsx(depStyles.radioCol, { checked: entry.depStatus === 1, keep: entry.keep })} onMouseDown={updateStatus}>
          {entry.depStatus === -1 && "N"}
          {entry.depStatus === 1 && COMPLETED_CHECKMARK_SYMBOL}
        </div>
        <div className={depStyles.pTimeCol}>0000</div>
        <div ref={ref} className={clsx(tableStyles.innerRow, { highlight: entry.highlighted, showFreeText: entry.showFreeText })}>
          <div className={clsx(tableStyles.fidCol, { hover: true, selected: isSelected("FID_DEP_ROW_FIELD") })} onMouseDown={handleFidClick}>
            {entry.cid} {entry.aircraftId}
            {/* eslint-disable-next-line no-nested-ternary */}
            <span className={tableStyles.voiceType}>{entry.voiceType === "r" ? "/R" : entry.voiceType === "t" ? "/T" : ""}</span>
          </div>
          <div className={clsx(tableStyles.specialBox, { isDisabled: !entry.spa })}>{entry.spa && SPA_INDICATOR}</div>
          <div className={tableStyles.hotbox} onMouseDown={handleHotboxMouseDown}>
            {freeTextContent && "*"}
          </div>
          <div className={clsx(tableStyles.specialBox, "isDisabled")} />
          <div
            className={clsx(tableStyles.acTypeCol, {
              hover: true,
              selected: isSelected("TYPE_DEP_ROW_FIELD"),
              visibilityHidden: hiddenColumns.includes("TYPE_DEP_ROW_FIELD"),
            })}
            onMouseDown={(e) => handleClick(e.currentTarget, "TYPE_DEP_ROW_FIELD", null)}
          >
            {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
          </div>
          <div className={tableStyles.altCol}>
            <div
              ref={altRef}
              className={clsx(tableStyles.innerAltCol, { hover: true, selected: isSelected("ALT_DEP_ROW_FIELD") })}
              onMouseDown={(e) => handleClick(e.currentTarget, "ALT_DEP_ROW_FIELD", "dep-alt-asel", "ALTITUDE_MENU")}
            >
              {entry.altitude}
            </div>
          </div>
          <div
            className={clsx(tableStyles.codeCol, {
              hover: true,
              selected: isSelected("CODE_DEP_ROW_FIELD"),
              visibilityHidden: hiddenColumns.includes("CODE_DEP_ROW_FIELD"),
            })}
            onMouseDown={(event) => handleClick(event.currentTarget, "CODE_DEP_ROW_FIELD", null)}
          >
            {convertBeaconCodeToString(entry.assignedBeaconCode)}
          </div>
          <div
            className={clsx(tableStyles.remarksBox, { unchecked: !entry.remarksChecked && entry.remarks.length > 0 })}
            onMouseDown={handleRemarksClick}
          >
            {entry.remarks.length > 0 && "*"}
          </div>
          <div
            className={clsx(tableStyles.routeCol, { hover: true, selected: isSelected("ROUTE_DEP_ROW_FIELD") })}
            ref={routeRef}
            onMouseDown={(e) => handleClick(e.currentTarget, "ROUTE_DEP_ROW_FIELD", "dep-route-asel", "ROUTE_MENU")}
          >
            <div className={clsx(tableStyles.routeContent, "pad")}>
              {entry.routeDisplay === "REMARKS_ROUTE_DISPLAY_OPTION" && <span>{entry.remarks}</span>}
              {entry.routeDisplay === "RAW_ROUTE_DISPLAY_OPTION" && <span>{entry.route}</span>}
              {!entry.routeDisplay && (
                <>
                  <div className={tableStyles.routeContent}>{entry.departure}</div>
                  {pendingPdar && !onPdar && (
                    <div className={clsx(tableStyles.embeddedRouteText, { selected: isSelected("ROUTE_DEP_ROW_FIELD") })}>{`[${pendingPdar}]`}</div>
                  )}
                  {!pendingPdar && pendingPdr && !onPdr && (
                    <div className={clsx(tableStyles.embeddedRouteText, { selected: isSelected("ROUTE_DEP_ROW_FIELD") })}>{`[${pendingPdr}]`}</div>
                  )}
                  {route}
                  {!pendingPdar && pendingPar && !onPar && (
                    <div className={clsx(tableStyles.embeddedRouteText, { selected: isSelected("ROUTE_DEP_ROW_FIELD") })}>{`[${pendingPar}]`}</div>
                  )}
                  {route?.slice(-1) !== "." && ".."}
                  {entry.destination}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {entry.showFreeText && (
        <div className={tableStyles.row}>
          <div className={clsx(depStyles.radioCol, "empty")} />
          <div className={depStyles.pTimeCol} />
          <div
            className={clsx(tableStyles.innerRow, { highlight: entry.highlighted })}
            style={{ minWidth: `${Math.max(1200, ref?.current?.clientWidth ?? 0)}px` }}
          >
            <div className={tableStyles.freeText} style={{ marginLeft: "calc(17ch + 11px)" }}>
              <input spellCheck={false} value={freeTextContent} onChange={(event) => setFreeTextContent(event.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
