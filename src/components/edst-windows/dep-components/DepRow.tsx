import React, { useCallback, useEffect, useRef, useState } from "react";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { delEntry, toggleSpa, updateEntry } from "../../../redux/slices/entrySlice";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { aselSelector } from "../../../redux/slices/appSlice";
import { BodyRowContainerDiv, BodyRowDiv, FreeTextRow, InnerRow, InnerRow2 } from "../../../styles/styles";
import { DepCol2, DepFidCol, RadioCol } from "./DepStyled";
import { EdstEntry } from "../../../typeDefinitions/types/edstEntry";
import { depAircraftSelect } from "../../../redux/thunks/aircraftSelect";
import {
  AircraftTypeCol,
  AltCol,
  AltColDiv,
  CodeCol,
  EmbeddedRouteTextSpan,
  HotBox,
  RouteCol,
  RouteSpan,
  SpecialBox
} from "../../../styles/sharedColumns";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { DepRowField } from "../../../typeDefinitions/enums/dep/depRowField";
import { COMPLETED_CHECKMARK_SYMBOL, REMOVAL_TIMEOUT, SPA_INDICATOR } from "../../../utils/constants";
import { usePar, usePdar, usePdr } from "../../../api/prefrouteApi";
import { useRouteFixes } from "../../../api/aircraftApi";
import { ApiPreferentialDepartureRoute } from "../../../typeDefinitions/types/apiTypes/apiPreferentialDepartureRoute";
import { ApiPreferentialDepartureArrivalRoute } from "../../../typeDefinitions/types/apiTypes/apiPreferentialDepartureArrivalRoute";
import { ApiPreferentialArrivalRoute } from "../../../typeDefinitions/types/apiTypes/apiPreferentialArrivalRoute";
import { formatRoute } from "../../../utils/formatRoute";
import { openMenuThunk } from "../../../redux/thunks/openMenuThunk";
import { useAselEventListener } from "../../../hooks/useAselEventListener";
import { depHiddenColumnsSelector } from "../../../redux/slices/depSlice";
import { convertBeaconCodeToString, removeStringFromEnd } from "../../../utils/stringManipulation";
import { Nullable } from "../../../typeDefinitions/utility-types";

type DepRowProps = {
  entry: EdstEntry;
  index: number;
};

const checkParReroutePending = (pars: ApiPreferentialArrivalRoute[], currentFixNames: string[]) => {
  const eligiblePar = pars.filter(par => par.eligible);
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
  const eligibleRoutes = pdrs.filter(pdr => pdr.eligible);
  if (eligibleRoutes.length > 0) {
    const eligibleRnavRoutes = eligibleRoutes.filter(pdr => pdr.rnavRequired);
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
  const eligibleRoutes = pdars.filter(pdr => pdr.eligible);
  if (eligibleRoutes.length > 0) {
    const eligibleRnavRoutes = eligibleRoutes.filter(pdr => pdr.rnavRequired);
    if (eligibleRnavRoutes.length > 0) {
      return eligibleRnavRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].route;
    }
    return eligibleRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].route;
  }
  return null;
};

/**
 * Single ACL row
 * @param entry
 * @param index row index
 */
export const DepRow = ({ entry, index }: DepRowProps) => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const hiddenColumns = useRootSelector(depHiddenColumnsSelector);
  const formattedRoute = formatRoute(entry.route);
  const routeFixes = useRouteFixes(entry.aircraftId);
  const currentFixNames = routeFixes.map(fix => fix.name);

  const [onPar, setOnPar] = useState(false);
  const [onPdr, setOnPdr] = useState(false);
  const [onPdar, setOnPdar] = useState(false);
  const pdrs = usePdr(entry.aircraftId);
  const pdars = usePdar(entry.aircraftId);
  const pars = usePar(entry.aircraftId);

  const [pendingPdr, setPendingPdr] = useState(checkPdrReroutePending(pdrs));
  const [pendingPdar, setPendingPdar] = useState(checkPdarReroutePending(pdars));
  const [pendingPar, setPendingPar] = useState(checkParReroutePending(pars, currentFixNames));

  const now = new Date().getTime();
  const route = removeStringFromEnd(formattedRoute.slice(0), entry.destination);

  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent ?? "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPar = !!pars.filter(par => par.eligible && formattedRoute.includes(par.amendment))?.length;
    const onPdar = !!pdars.filter(pdar => pdar.eligible && formattedRoute === pdar.route).length;
    const onPdr = (pdrs.filter(pdr => route.startsWith(pdr.amendment))?.length ?? 0) > 0;
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
      return asel?.window === EdstWindow.DEP && asel?.aircraftId === entry.aircraftId && asel?.field === field;
    },
    [asel?.aircraftId, asel?.field, asel?.window, entry.aircraftId]
  );

  const handleClick = useCallback(
    (element: HTMLElement, field: DepRowField, eventId: Nullable<string>, opensWindow?: EdstWindow, triggerSharedState = true) => {
      dispatch(depAircraftSelect(entry.aircraftId, field, eventId, triggerSharedState));
      if (opensWindow && !isSelected(field)) {
        dispatch(openMenuThunk(opensWindow, element, false, false, true));
      }
    },
    [dispatch, entry.aircraftId, isSelected]
  );
  const altRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);

  useAselEventListener<DepRowField>(altRef, entry.aircraftId, "dep-alt-asel", DepRowField.ALT, EdstWindow.ALTITUDE_MENU, handleClick);
  useAselEventListener<DepRowField>(routeRef, entry.aircraftId, "dep-route-asel", DepRowField.ROUTE, EdstWindow.ROUTE_MENU, handleClick);

  const handleHotboxMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    if (event.button === 0) {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { showFreeText: !entry.showFreeText } }));
    }
    if (event.button === 1) {
      dispatch(toggleSpa(entry.aircraftId));
    }
    if (event.button === 2) {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { highlighted: !entry.highlighted } }));
    }
  };

  const updateStatus = () => {
    if (entry.depStatus === -1) {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { depStatus: 0 } }));
    } else if (entry.depStatus < 1) {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { depStatus: 1 } }));
    } else {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { depStatus: 0 } }));
    }
  };

  const handleFidClick: React.MouseEventHandler<HTMLDivElement> = event => {
    const now = new Date().getTime();
    switch (event.button) {
      case 2:
        if (now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT) {
          dispatch(delEntry(entry.aircraftId));
        }
        break;
      default:
        dispatch(depAircraftSelect(entry.aircraftId, DepRowField.FID, null));
        break;
    }
  };

  return (
    <BodyRowContainerDiv separator={index % 3 === 2} onContextMenu={event => event.preventDefault()}>
      <BodyRowDiv pendingRemoval={now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT}>
        <EdstTooltip title={Tooltips.depCheckmarkNBtn}>
          <RadioCol checked={entry.depStatus === 1} onMouseDown={updateStatus} keep={entry.keep}>
            {entry.depStatus === -1 && "N"}
            {entry.depStatus === 1 && COMPLETED_CHECKMARK_SYMBOL}
          </RadioCol>
        </EdstTooltip>
        <DepCol2>0000</DepCol2>
        <InnerRow highlight={entry.highlighted} ref={ref} style={{ minWidth: entry.showFreeText ? "1200px" : 0 }}>
          <EdstTooltip title={Tooltips.depFlightId}>
            <DepFidCol
              hover
              selected={isSelected(DepRowField.FID)}
              onMouseDown={handleFidClick}
              onContextMenu={(event: React.MouseEvent) => event.preventDefault()}
            >
              {entry.cid} {entry.aircraftId}
              {/* eslint-disable-next-line no-nested-ternary */}
              {entry.voiceType === "r" ? "/R" : entry.voiceType === "t" ? "/T" : ""}
            </DepFidCol>
          </EdstTooltip>
          <SpecialBox disabled={!entry.spa}>{entry.spa && SPA_INDICATOR}</SpecialBox>
          <EdstTooltip title={Tooltips.depHotbox}>
            <HotBox onMouseDown={handleHotboxMouseDown}>{freeTextContent && "*"}</HotBox>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depType}>
            <AircraftTypeCol
              visibilityHidden={hiddenColumns.includes(DepRowField.TYPE)}
              hover
              selected={isSelected(DepRowField.TYPE)}
              onMouseDown={e => handleClick(e.currentTarget, DepRowField.TYPE, null)}
            >
              {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
            </AircraftTypeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depAlt}>
            <AltCol>
              <AltColDiv
                ref={altRef}
                selected={isSelected(DepRowField.ALT)}
                onMouseDown={e => handleClick(e.currentTarget, DepRowField.ALT, "dep-alt-asel", EdstWindow.ALTITUDE_MENU)}
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
              onMouseDown={e => handleClick(e.currentTarget, DepRowField.CODE, null)}
            >
              {convertBeaconCodeToString(entry.assignedBeaconCode)}
            </CodeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depRoute}>
            <RouteCol
              ref={routeRef}
              hover
              selected={isSelected(DepRowField.ROUTE)}
              onMouseDown={e => handleClick(e.currentTarget, DepRowField.ROUTE, "dep-route-asel", EdstWindow.ROUTE_MENU)}
            >
              <RouteSpan padding="0 2px">
                <RouteSpan>
                  {/* className={`${((parAvail && !onPar) || (pdrAvail && !onPdr)) ? 'amendment-1' : ''} ${isSelected(entry.aircraftId, depRowFieldEnum.route) ? 'selected' : ''}`}> */}
                  {entry.departure}
                </RouteSpan>
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
              </RouteSpan>
            </RouteCol>
          </EdstTooltip>
        </InnerRow>
      </BodyRowDiv>
      {entry.showFreeText && (
        <BodyRowDiv>
          <RadioCol disabled />
          <DepCol2 />
          <InnerRow2 highlight={entry.highlighted} minWidth={`${Math.max(1200, ref?.current?.clientWidth ?? 0)}px`}>
            <FreeTextRow marginLeft="22ch">
              <input value={freeTextContent} onChange={event => setFreeTextContent(event.target.value)} />
            </FreeTextRow>
          </InnerRow2>
        </BodyRowDiv>
      )}
    </BodyRowContainerDiv>
  );
};
