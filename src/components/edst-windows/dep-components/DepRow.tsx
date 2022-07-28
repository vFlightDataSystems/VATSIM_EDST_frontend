import React, { useEffect, useRef, useState } from "react";
import { convertBeaconCodeToString, formatAltitude, REMOVAL_TIMEOUT, removeDestFromRouteString } from "../../../lib";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { rmvEntryFromDep, toggleSpa, updateEntry } from "../../../redux/slices/entrySlice";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { aselSelector } from "../../../redux/slices/appSlice";
import { BodyRowContainerDiv, BodyRowDiv, FreeTextRow, InnerRow, InnerRow2 } from "../../../styles/bodyStyles";
import {
  AircraftTypeCol,
  AltCol,
  AltColDiv,
  DepCol2,
  FidCol,
  HotBox,
  RadioCol,
  RouteAmendmentSpan,
  RouteCol,
  RouteSpan,
  SpecialBox
} from "./DepStyled";
import { CodeCol } from "../acl-components/AclStyled";
import { EdstWindow, DepRowField } from "../../../namespaces";
import { ApiPreferentialDepartureRoute } from "../../../types/apiPreferentialDepartureRoute";
import { ApiPreferentialDepartureArrivalRoute } from "../../../types/apiPreferentialDepartureArrivalRoute";
import { EdstEntry } from "../../../types/edstEntry";
import { depAircraftSelect } from "../../../redux/thunks/aircraftSelect";

const SPA_INDICATOR = "\u2303";
const COMPLETED_SYMBOL = "✓";

type DepRowProps = {
  entry: EdstEntry;
  hidden: DepRowField[];
  index: number;
};

export const DepRow: React.FC<DepRowProps> = ({ entry, hidden, index }) => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const [onPar, setOnPar] = useState(false);
  const [onPdr, setOnPdr] = useState(false);
  const [onPdar, setOnPdar] = useState(false);

  const now = new Date().getTime();
  const route = removeDestFromRouteString(entry.formattedRoute.slice(0), entry.destination);

  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent ?? "");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPar = !!entry.preferentialArrivalRoutes?.filter(par => par.eligible && entry.formattedRoute.includes(par.amendment))?.length;
    const onPdar = !!entry.preferentialDepartureArrivalRoutes.filter(pdar => pdar.eligible && entry.formattedRoute === pdar.route).length;
    setOnPar(onPar);
    setOnPdar(onPdar);

    const onPdr = (entry.preferentialDepartureRoutes?.filter(pdr => route.startsWith(pdr.amendment))?.length ?? 0) > 0;
    setOnPdr(onPdr);
  }, [entry.preferentialArrivalRoutes, entry.preferentialDepartureRoutes, entry.routeFixes, route]);

  const checkParReroutePending = () => {
    const currentFixNames = (entry.currentRouteFixes ?? entry.routeFixes).map(fix => fix.name);
    const eligiblePar = entry.preferentialArrivalRoutes.filter(par => par.eligible);
    if (eligiblePar.length === 1) {
      const par = eligiblePar[0];
      if (currentFixNames.includes(par.triggeredFix)) {
        return par.amendment;
      }
    }
    return null;
  };

  const checkPdrReroutePending = (routes: ApiPreferentialDepartureRoute[]) => {
    if (routes.length === 0) {
      return null;
    }
    const eligibleRoutes = routes.filter(pdr => pdr.eligible);
    if (eligibleRoutes.length > 0) {
      const eligibleRnavRoutes = eligibleRoutes.filter(pdr => pdr.rnavRequired);
      if (eligibleRnavRoutes.length > 0) {
        return eligibleRnavRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].amendment;
      }
      return eligibleRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].amendment;
    }
    return null;
  };
  const checkPdarReroutePending = (routes: ApiPreferentialDepartureArrivalRoute[]) => {
    if (routes.length === 0) {
      return null;
    }
    const eligibleRoutes = routes.filter(pdr => pdr.eligible);
    if (eligibleRoutes.length > 0) {
      const eligibleRnavRoutes = eligibleRoutes.filter(pdr => pdr.rnavRequired);
      if (eligibleRnavRoutes.length > 0) {
        return eligibleRnavRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].route;
      }
      return eligibleRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].route;
    }
    return null;
  };

  const pendingPdr = checkPdrReroutePending(entry.preferentialDepartureRoutes);
  const pendingPdar = checkPdarReroutePending(entry.preferentialDepartureArrivalRoutes);
  const pendingPar = checkParReroutePending();

  const handleHotboxMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    if (event.button === 0) {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { showFreeText: !entry.showFreeText } }));
    }
    if (event.button === 1) {
      dispatch(toggleSpa(entry.aircraftId));
    }
    if (event.button === 2) {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { depHighlighted: !entry.depHighlighted } }));
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

  const handleFidClick = (event: React.MouseEvent) => {
    const now = new Date().getTime();
    switch (event.button) {
      case 2:
        if (now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT) {
          dispatch(rmvEntryFromDep(entry.aircraftId));
        }
        break;
      default:
        dispatch(depAircraftSelect(event, entry.aircraftId, DepRowField.FID));
        break;
    }
  };

  const isSelected = (aircraftId: string, field: DepRowField): boolean => {
    return asel?.window === EdstWindow.DEP && asel?.aircraftId === aircraftId && asel?.field === field;
  };

  return (
    <BodyRowContainerDiv separator={index % 3 === 2} key={`dep-row-container-${entry.aircraftId}`} onContextMenu={event => event.preventDefault()}>
      <BodyRowDiv pendingRemoval={now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT}>
        <EdstTooltip title={Tooltips.depCheckmarkNBtn}>
          <RadioCol checked={entry.depStatus === 1} onMouseDown={updateStatus}>
            {entry.depStatus === -1 && "N"}
            {entry.depStatus === 1 && COMPLETED_SYMBOL}
          </RadioCol>
        </EdstTooltip>
        <DepCol2>0000</DepCol2>
        <InnerRow highlight={entry.depHighlighted} ref={ref} style={{ minWidth: entry.showFreeText ? "1200px" : 0 }}>
          <EdstTooltip title={Tooltips.depFlightId}>
            <FidCol
              hover
              selected={isSelected(entry.aircraftId, DepRowField.FID)}
              onMouseDown={handleFidClick}
              onContextMenu={event => event.preventDefault()}
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
          <EdstTooltip title={Tooltips.depType}>
            <AircraftTypeCol
              contentHidden={hidden.includes(DepRowField.TYPE)}
              hover
              selected={isSelected(entry.aircraftId, DepRowField.TYPE)}
              onMouseDown={event => dispatch(depAircraftSelect(event, entry.aircraftId, DepRowField.TYPE))}
            >
              {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
            </AircraftTypeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depAlt}>
            <AltCol>
              <AltColDiv
                selected={isSelected(entry.aircraftId, DepRowField.ALT)}
                onMouseDown={event => dispatch(depAircraftSelect(event, entry.aircraftId, DepRowField.ALT, null, EdstWindow.ALTITUDE_MENU))}
              >
                {formatAltitude(entry.altitude)}
                {entry.interimAltitude && `T${entry.interimAltitude}`}
              </AltColDiv>
            </AltCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depCode}>
            <CodeCol
              contentHidden={hidden.includes(DepRowField.CODE)}
              hover
              selected={isSelected(entry.aircraftId, DepRowField.CODE)}
              onMouseDown={event => dispatch(depAircraftSelect(event, entry.aircraftId, DepRowField.CODE))}
            >
              {convertBeaconCodeToString(entry.assignedBeaconCode)}
            </CodeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depRoute}>
            <RouteCol
              hover
              selected={isSelected(entry.aircraftId, DepRowField.ROUTE)}
              onMouseDown={event => dispatch(depAircraftSelect(event, entry.aircraftId, DepRowField.ROUTE, null, EdstWindow.ROUTE_MENU))}
            >
              <RouteSpan padding="0 2px">
                <RouteSpan>
                  {/* className={`${((parAvail && !onPar) || (pdrAvail && !onPdr)) ? 'amendment-1' : ''} ${isSelected(entry.aircraftId, depRowFieldEnum.route) ? 'selected' : ''}`}> */}
                  {entry.departure}
                </RouteSpan>
                {pendingPdar && !onPdar && (
                  <RouteAmendmentSpan selected={isSelected(entry.aircraftId, DepRowField.ROUTE)}>{`[${pendingPdar}]`}</RouteAmendmentSpan>
                )}
                {!pendingPdar && pendingPdr && !onPdr && (
                  <RouteAmendmentSpan selected={isSelected(entry.aircraftId, DepRowField.ROUTE)}>{`[${pendingPdr}]`}</RouteAmendmentSpan>
                )}
                {route}
                {!pendingPdar && pendingPar && !onPar && (
                  <RouteAmendmentSpan selected={isSelected(entry.aircraftId, DepRowField.ROUTE)}>{`[${pendingPar}]`}</RouteAmendmentSpan>
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
          <InnerRow2 highlight={entry.depHighlighted} minWidth={Math.max(1200, ref?.current?.clientWidth ?? 0)}>
            <FreeTextRow marginLeft={202}>
              <input value={freeTextContent} onChange={event => setFreeTextContent(event.target.value.toUpperCase())} />
            </FreeTextRow>
          </InnerRow2>
        </BodyRowDiv>
      )}
    </BodyRowContainerDiv>
  );
};
