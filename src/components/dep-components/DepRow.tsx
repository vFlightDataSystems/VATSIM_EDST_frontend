import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Nullable } from "types/utility-types";
import { delEntry, entrySelector, toggleSpa, updateEntry } from "~redux/slices/entrySlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aircraftIsAselSelector } from "~redux/slices/appSlice";
import { BodyRowContainerDiv, BodyRowDiv, FreeTextInput, FreeTextRow, InnerRow, InnerRow2 } from "styles/styles";
import { depAircraftSelect } from "~redux/thunks/aircraftSelect";
import {
  AircraftTypeCol,
  AltCol,
  AltColDiv,
  CodeCol,
  EmbeddedRouteText,
  FidCol,
  HotBox,
  RouteCol,
  RouteContent,
  SpecialBox,
} from "styles/sharedColumns";
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
import { RemarksBox } from "components/AclStyled";
import { DepPTimeCol, RadioCol } from "components/DepStyled";

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
  const entry = useRootSelector((state) => entrySelector(state, aircraftId));
  const asel = useRootSelector((state) => aircraftIsAselSelector(state, aircraftId));
  const manualPosting = useRootSelector(depManualPostingSelector);
  const hiddenColumns = useRootSelector(depHiddenColumnsSelector);
  const formattedRoute = formatRoute(entry.route);
  const routeFixes = useRouteFixes(aircraftId);
  const currentFixNames = routeFixes.map((fix) => fix.name);

  const [onPar, setOnPar] = useState(false);
  const [onPdr, setOnPdr] = useState(false);
  const [onPdar, setOnPdar] = useState(false);
  const pdrs = usePdr(aircraftId);
  const pdars = usePdar(aircraftId);
  const pars = usePar(aircraftId);

  const [pendingPdr, setPendingPdr] = useState(checkPdrReroutePending(pdrs));
  const [pendingPdar, setPendingPdar] = useState(checkPdarReroutePending(pdars));
  const [pendingPar, setPendingPar] = useState(checkParReroutePending(pars, currentFixNames));

  const now = Date.now();
  const route = removeStringFromEnd(formattedRoute.slice(0), entry.destination);

  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPar = pars.filter((par) => par.eligible && formattedRoute.includes(par.amendment)).length > 0;
    const onPdar = pdars.filter((pdar) => pdar.eligible && formattedRoute === pdar.route).length > 0;
    const onPdr = pdrs.filter((pdr) => route.startsWith(pdr.amendment)).length > 0;
    setOnPar(onPar);
    setOnPdar(onPdar);
    setOnPdr(onPdr);
    if (!onPar) {
      setPendingPar(checkParReroutePending(pars, currentFixNames));
    }
    if (!onPdar) {
      setPendingPdar(checkPdarReroutePending(pdars));
    }
    if (!onPdr) {
      setPendingPdr(checkPdrReroutePending(pdrs));
    }
  }, [pdrs, pdars, pars, routeFixes, route, formattedRoute, currentFixNames]);

  const isSelected = useCallback(
    (field: DepRowField): boolean => {
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
    <BodyRowContainerDiv>
      <BodyRowDiv pendingRemoval={now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT}>
        <RadioCol checked={entry.depStatus === 1} onMouseDown={updateStatus} keep={entry.keep}>
          {entry.depStatus === -1 && "N"}
          {entry.depStatus === 1 && COMPLETED_CHECKMARK_SYMBOL}
        </RadioCol>
        <DepPTimeCol>0000</DepPTimeCol>
        <InnerRow ref={ref} highlight={entry.highlighted} minWidth={entry.showFreeText ? "1200px" : 0}>
          <FidCol hover selected={isSelected("FID_DEP_ROW_FIELD")} onMouseDown={handleFidClick}>
            {entry.cid} {entry.aircraftId}
            {/* eslint-disable-next-line no-nested-ternary */}
            {entry.voiceType === "r" ? "/R" : entry.voiceType === "t" ? "/T" : ""}
          </FidCol>
          <SpecialBox disabled={!entry.spa}>{entry.spa && SPA_INDICATOR}</SpecialBox>
          <HotBox onMouseDown={handleHotboxMouseDown}>{freeTextContent && "*"}</HotBox>
          <SpecialBox disabled />
          <AircraftTypeCol
            visibilityHidden={hiddenColumns.includes("TYPE_DEP_ROW_FIELD")}
            hover
            selected={isSelected("TYPE_DEP_ROW_FIELD")}
            onMouseDown={(e) => handleClick(e.currentTarget, "TYPE_DEP_ROW_FIELD", null)}
          >
            {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
          </AircraftTypeCol>
          <AltCol>
            <AltColDiv
              ref={altRef}
              selected={isSelected("ALT_DEP_ROW_FIELD")}
              onMouseDown={(e) => handleClick(e.currentTarget, "ALT_DEP_ROW_FIELD", "dep-alt-asel", "ALTITUDE_MENU")}
            >
              {entry.altitude}
            </AltColDiv>
          </AltCol>
          <CodeCol
            visibilityHidden={hiddenColumns.includes("CODE_DEP_ROW_FIELD")}
            hover
            selected={isSelected("CODE_DEP_ROW_FIELD")}
            onMouseDown={(e) => handleClick(e.currentTarget, "CODE_DEP_ROW_FIELD", null)}
          >
            {convertBeaconCodeToString(entry.assignedBeaconCode)}
          </CodeCol>
          <RemarksBox unchecked={!entry.remarksChecked && entry.remarks.length > 0} onMouseDown={handleRemarksClick}>
            {entry.remarks.length > 0 && "*"}
          </RemarksBox>
          <RouteCol
            ref={routeRef}
            hover
            selected={isSelected("ROUTE_DEP_ROW_FIELD")}
            onMouseDown={(e) => handleClick(e.currentTarget, "ROUTE_DEP_ROW_FIELD", "dep-route-asel", "ROUTE_MENU")}
          >
            <RouteContent padding="0 2px">
              {entry.routeDisplay === "REMARKS_ROUTE_DISPLAY_OPTION" && <span>{entry.remarks}</span>}
              {entry.routeDisplay === "RAW_ROUTE_DISPLAY_OPTION" && <span>{entry.route}</span>}
              {!entry.routeDisplay && (
                <>
                  <RouteContent>{entry.departure}</RouteContent>
                  {pendingPdar && !onPdar && <EmbeddedRouteText selected={isSelected("ROUTE_DEP_ROW_FIELD")}>{`[${pendingPdar}]`}</EmbeddedRouteText>}
                  {!pendingPdar && pendingPdr && !onPdr && (
                    <EmbeddedRouteText selected={isSelected("ROUTE_DEP_ROW_FIELD")}>{`[${pendingPdr}]`}</EmbeddedRouteText>
                  )}
                  {route}
                  {!pendingPdar && pendingPar && !onPar && (
                    <EmbeddedRouteText selected={isSelected("ROUTE_DEP_ROW_FIELD")}>{`[${pendingPar}]`}</EmbeddedRouteText>
                  )}
                  {route?.slice(-1) !== "." && ".."}
                  {entry.destination}
                </>
              )}
            </RouteContent>
          </RouteCol>
        </InnerRow>
      </BodyRowDiv>
      {entry.showFreeText && (
        <BodyRowDiv>
          <RadioCol disabled />
          <DepPTimeCol />
          <InnerRow2 highlight={entry.highlighted} minWidth={`${Math.max(1200, ref?.current?.clientWidth ?? 0)}px`}>
            <FreeTextRow marginLeft="calc(17ch + 11px)">
              <FreeTextInput value={freeTextContent} onChange={(event) => setFreeTextContent(event.target.value)} />
            </FreeTextRow>
          </InnerRow2>
        </BodyRowDiv>
      )}
    </BodyRowContainerDiv>
  );
});
