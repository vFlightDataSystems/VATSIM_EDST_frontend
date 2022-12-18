import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Nullable } from "types/utility-types";
import { delEntry, entrySelector, toggleSpa, updateEntry } from "~redux/slices/entrySlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aircraftIsAselSelector } from "~redux/slices/appSlice";
import { depAircraftSelect } from "~redux/thunks/aircraftSelect";
import type { EdstWindow } from "types/edstWindow";
import type { DepRowField } from "types/dep/depRowField";
import { COMPLETED_CHECKMARK_SYMBOL, REMOVAL_TIMEOUT, SPA_INDICATOR } from "~/utils/constants";
import { useAar, useAdar, useAdr } from "api/prefrouteApi";
import { useRouteFixes } from "api/aircraftApi";
import type { ApiAdaptedDepartureRoute } from "types/apiTypes/apiAdaptedDepartureRoute";
import type { ApiAdaptedDepartureArrivalRoute } from "types/apiTypes/apiAdaptedDepartureArrivalRoute";
import type { ApiAdaptedArrivalRoute } from "types/apiTypes/apiAdaptedArrivalRoute";
import { formatRoute } from "~/utils/formatRoute";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useAselEventListener } from "hooks/useAselEventListener";
import { depHiddenColumnsSelector, depManualPostingSelector } from "~redux/slices/depSlice";
import type { AircraftId } from "types/aircraftId";
import { convertBeaconCodeToString, removeStringFromEnd } from "~/utils/stringManipulation";
import tableStyles from "css/table.module.scss";
import clsx from "clsx";

type DepRowProps = {
  aircraftId: AircraftId;
};

const checkAarReroutePending = (aars: ApiAdaptedArrivalRoute[], currentFixNames: string[]) => {
  const eligibleAar = aars.filter((aar) => aar.eligible);
  if (eligibleAar.length === 1) {
    const aar = eligibleAar[0];
    if (currentFixNames.includes(aar.triggeredFix)) {
      return aar.amendment;
    }
  }
  return null;
};

const checkAdrReroutePending = (adrs: ApiAdaptedDepartureRoute[]) => {
  if (adrs.length === 0) {
    return null;
  }
  const eligibleRoutes = adrs.filter((adr) => adr.eligible);
  if (eligibleRoutes.length > 0) {
    const eligibleRnavRoutes = eligibleRoutes.filter((adr) => adr.rnavRequired);
    if (eligibleRnavRoutes.length > 0) {
      return eligibleRnavRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].amendment;
    }
    return eligibleRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].amendment;
  }
  return null;
};
const checkAdarReroutePending = (adars: ApiAdaptedDepartureArrivalRoute[]) => {
  if (adars.length === 0) {
    return null;
  }
  const eligibleRoutes = adars.filter((adr) => adr.eligible);
  if (eligibleRoutes.length > 0) {
    const eligibleRnavRoutes = eligibleRoutes.filter((adr) => adr.rnavRequired);
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
  const adrs = useAdr(aircraftId);
  const adars = useAdar(aircraftId);
  const aars = useAar(aircraftId);

  const route = useMemo(() => {
    const formattedRoute = formatRoute(entry.route);
    return removeStringFromEnd(formattedRoute.slice(0), entry.destination);
  }, [entry.destination, entry.route]);

  useEffect(() => {
    setFreeTextContent(entry.freeTextContent);
  }, [entry.freeTextContent]);

  const pendingAdr = useMemo(() => {
    const onAdr = adrs.filter((adr) => adr.eligible && route.startsWith(adr.amendment)).length > 0;
    if (!onAdr) {
      return checkAdrReroutePending(adrs);
    }
    return null;
  }, [adrs, route]);

  const pendingAdar = useMemo(() => {
    const onAdar = adars.filter((adar) => adar.eligible && route === adar.route).length > 0;
    if (!onAdar) {
      return checkAdarReroutePending(adars);
    }
    return null;
  }, [adars, route]);

  const pendingAar = useMemo(() => {
    const currentFixNames = routeFixes.map((fix) => fix.name);
    const onAar = aars.filter((aar) => aar.eligible && route.includes(aar.amendment)).length > 0;
    if (!onAar) {
      return checkAarReroutePending(aars, currentFixNames);
    }
    return null;
  }, [aars, route, routeFixes]);

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
        <div className={clsx(tableStyles.checkmarkCol, { checked: entry.depStatus === 1, keep: entry.keep })} onMouseDown={updateStatus}>
          {entry.depStatus === -1 && "N"}
          {entry.depStatus === 1 && COMPLETED_CHECKMARK_SYMBOL}
        </div>
        <div className={tableStyles.pTimeCol}>0000</div>
        <div ref={ref} className={clsx(tableStyles.innerRow, { highlight: entry.highlighted, showFreeText: entry.showFreeText })}>
          <div className={clsx(tableStyles.fidCol, { hover: true, selected: isSelected("FID_DEP_ROW_FIELD") })} onMouseDown={handleFidClick}>
            {entry.cid} {entry.aircraftId}
            {/* eslint-disable-next-line no-nested-ternary */}
            {/* <span className={tableStyles.voiceType}>{entry.voiceType === "r" ? "/R" : entry.voiceType === "t" ? "/T" : ""}</span> */}
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
                  {pendingAdar && (
                    <div className={clsx(tableStyles.embeddedRouteText, { selected: isSelected("ROUTE_DEP_ROW_FIELD") })}>{`[${pendingAdar}]`}</div>
                  )}
                  {!pendingAdar && pendingAdr && (
                    <div className={clsx(tableStyles.embeddedRouteText, { selected: isSelected("ROUTE_DEP_ROW_FIELD") })}>{`[${pendingAdr}]`}</div>
                  )}
                  {route}
                  {!pendingAdar && pendingAar && (
                    <div className={clsx(tableStyles.embeddedRouteText, { selected: isSelected("ROUTE_DEP_ROW_FIELD") })}>{`[${pendingAar}]`}</div>
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
          <div className={clsx(tableStyles.checkmarkCol, tableStyles.empty)} />
          <div className={tableStyles.pTimeCol} />
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
