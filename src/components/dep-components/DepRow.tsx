import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Nullable } from "types/utility-types";
import { Tooltips } from "~/tooltips";
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
  EmbeddedRouteTextSpan,
  FidCol,
  HotBox,
  RouteCol,
  RouteSpan,
  SpecialBox,
} from "styles/sharedColumns";
import { EdstWindow } from "enums/edstWindow";
import { DepRowField } from "enums/dep/depRowField";
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
import { RouteDisplayOption } from "enums/routeDisplayOption";
import { convertBeaconCodeToString, removeStringFromEnd } from "~/utils/stringManipulation";
import { RemarksBox } from "components/AclStyled";
import { DepPTimeCol, RadioCol } from "components/DepStyled";
import { EdstTooltip } from "components/utils/EdstTooltip";

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
 * @param aircraftId
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

  const now = new Date().getTime();
  const route = removeStringFromEnd(formattedRoute.slice(0), entry.destination);

  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPar = !!pars.filter((par) => par.eligible && formattedRoute.includes(par.amendment))?.length;
    const onPdar = !!pdars.filter((pdar) => pdar.eligible && formattedRoute === pdar.route).length;
    const onPdr = (pdrs.filter((pdr) => route.startsWith(pdr.amendment))?.length ?? 0) > 0;
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
      return asel?.window === EdstWindow.DEP && asel?.aircraftId === aircraftId && asel?.field === field;
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

  useAselEventListener<DepRowField>(altRef, aircraftId, "dep-alt-asel", DepRowField.ALT, EdstWindow.ALTITUDE_MENU, handleClick);
  useAselEventListener<DepRowField>(routeRef, aircraftId, "dep-route-asel", DepRowField.ROUTE, EdstWindow.ROUTE_MENU, handleClick);

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
    const now = new Date().getTime();
    switch (event.button) {
      case 2:
        if (now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT) {
          dispatch(delEntry(aircraftId));
        }
        break;
      default:
        dispatch(depAircraftSelect(aircraftId, DepRowField.FID, null));
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
              routeDisplay: !(entry.routeDisplay === RouteDisplayOption.remarks) && entry.remarks.length > 0 ? RouteDisplayOption.remarks : null,
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
              routeDisplay: !(entry.routeDisplay === RouteDisplayOption.rawRoute) ? RouteDisplayOption.rawRoute : null,
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
        <EdstTooltip title={Tooltips.depCheckmarkNBtn}>
          <RadioCol checked={entry.depStatus === 1} onMouseDown={updateStatus} keep={entry.keep}>
            {entry.depStatus === -1 && "N"}
            {entry.depStatus === 1 && COMPLETED_CHECKMARK_SYMBOL}
          </RadioCol>
        </EdstTooltip>
        <DepPTimeCol>0000</DepPTimeCol>
        <InnerRow highlight={entry.highlighted} ref={ref} style={{ minWidth: entry.showFreeText ? "1200px" : 0 }}>
          <EdstTooltip title={Tooltips.depFlightId}>
            <FidCol
              hover
              selected={isSelected(DepRowField.FID)}
              onMouseDown={handleFidClick}
              onContextMenu={(event: React.MouseEvent) => event.preventDefault()}
            >
              {entry.cid} {entry.aircraftId}
              {/* eslint-disable-next-line no-nested-ternary */}
              {entry.voiceType === "r" ? "/R" : entry.voiceType === "t" ? "/T" : ""}
            </FidCol>
          </EdstTooltip>
          <SpecialBox disabled={!entry.spa}>{entry.spa && SPA_INDICATOR}</SpecialBox>
          <EdstTooltip title={Tooltips.depHotbox}>
            <HotBox onMouseDown={handleHotboxMouseDown}>{freeTextContent && "*"}</HotBox>
          </EdstTooltip>
          <SpecialBox disabled />
          <EdstTooltip title={Tooltips.depType}>
            <AircraftTypeCol
              visibilityHidden={hiddenColumns.includes(DepRowField.TYPE)}
              hover
              selected={isSelected(DepRowField.TYPE)}
              onMouseDown={(e) => handleClick(e.currentTarget, DepRowField.TYPE, null)}
            >
              {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
            </AircraftTypeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depAlt}>
            <AltCol>
              <AltColDiv
                ref={altRef}
                selected={isSelected(DepRowField.ALT)}
                onMouseDown={(e) => handleClick(e.currentTarget, DepRowField.ALT, "dep-alt-asel", EdstWindow.ALTITUDE_MENU)}
              >
                {entry.altitude}
              </AltColDiv>
            </AltCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depCode}>
            <CodeCol
              visibilityHidden={hiddenColumns.includes(DepRowField.CODE)}
              hover
              selected={isSelected(DepRowField.CODE)}
              onMouseDown={(e) => handleClick(e.currentTarget, DepRowField.CODE, null)}
            >
              {convertBeaconCodeToString(entry.assignedBeaconCode)}
            </CodeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclRemarksBtn}>
            <RemarksBox unchecked={!entry.remarksChecked && entry.remarks.length > 0} onMouseDown={handleRemarksClick}>
              {entry.remarks.length > 0 && "*"}
            </RemarksBox>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depRoute}>
            <RouteCol
              ref={routeRef}
              hover
              selected={isSelected(DepRowField.ROUTE)}
              onMouseDown={(e) => handleClick(e.currentTarget, DepRowField.ROUTE, "dep-route-asel", EdstWindow.ROUTE_MENU)}
            >
              <RouteSpan padding="0 2px">
                {entry.routeDisplay === RouteDisplayOption.remarks && <span>{entry.remarks}</span>}
                {entry.routeDisplay === RouteDisplayOption.rawRoute && <span>{entry.route}</span>}
                {!entry.routeDisplay && (
                  <>
                    <RouteSpan>{entry.departure}</RouteSpan>
                    {pendingPdar && !onPdar && (
                      <EmbeddedRouteTextSpan selected={isSelected(DepRowField.ROUTE)}>{`[${pendingPdar}]`}</EmbeddedRouteTextSpan>
                    )}
                    {!pendingPdar && pendingPdr && !onPdr && (
                      <EmbeddedRouteTextSpan selected={isSelected(DepRowField.ROUTE)}>{`[${pendingPdr}]`}</EmbeddedRouteTextSpan>
                    )}
                    {route}
                    {!pendingPdar && pendingPar && !onPar && (
                      <EmbeddedRouteTextSpan selected={isSelected(DepRowField.ROUTE)}>{`[${pendingPar}]`}</EmbeddedRouteTextSpan>
                    )}
                    {route?.slice(-1) !== "." && ".."}
                    {entry.destination}
                  </>
                )}
              </RouteSpan>
            </RouteCol>
          </EdstTooltip>
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
