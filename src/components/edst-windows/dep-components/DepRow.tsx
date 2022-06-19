import React, { useEffect, useRef, useState } from "react";
import { convertBeaconCodeToString, formatAltitude, REMOVAL_TIMEOUT, removeDestFromRouteString } from "../../../lib";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { LocalEdstEntry, PreferentialDepartureArrivalRoute, PreferentialDepartureRoute } from "../../../types";
import { deleteDepEntry, toggleSpa, updateEntry } from "../../../redux/slices/entriesSlice";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { aselSelector } from "../../../redux/slices/appSlice";
import { depAircraftSelect } from "../../../redux/thunks/thunks";
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

const SPA_INDICATOR = "\u2303";
const COMPLETED_SYMBOL = "✓";

type DepRowProps = {
  entry: LocalEdstEntry;
  hidden: DepRowField[];
  index: number;
};

export const DepRow: React.FC<DepRowProps> = ({ entry, hidden, index }) => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const [aarAvail, setAarAvail] = useState(false);
  const [onAar, setOnAar] = useState(false);
  const [adrAvail, setAdrAvail] = useState(false);
  const [onAdr, setOnAdr] = useState(false);
  const [onAdar, setOnAdar] = useState(false);

  const now = new Date().getTime();
  const route = removeDestFromRouteString(entry.formattedRoute.slice(0), entry.destination);

  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent ?? "");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentFixNames = entry.routeFixes.map(fix => fix.name);
    const aarAvail = !!entry.preferentialArrivalRoutes?.filter(aar => aar.eligible && currentFixNames.includes(aar.triggeredFix)).length;
    const onAar = !!entry.preferentialArrivalRoutes?.filter(aar => aar.eligible && entry.formattedRoute.includes(aar.amendment))?.length;
    const onAdar = !!entry.preferentialDepartureArrivalRoutes.filter(adar => adar.eligible && entry.formattedRoute === adar.route).length;
    setAarAvail(aarAvail);
    setOnAar(onAar);
    setOnAdar(onAdar);

    const adrAvail = !!entry.preferentialDepartureRoutes?.filter(adr => adr.eligible).length;
    const onAdr = (entry.preferentialDepartureRoutes?.filter(adr => route.startsWith(adr.amendment))?.length ?? 0) > 0;
    setAdrAvail(adrAvail);
    setOnAdr(onAdr);
  }, [entry.preferentialArrivalRoutes, entry.preferentialDepartureRoutes, entry.routeFixes, route]);

  const checkAarReroutePending = () => {
    const currentFixNames = (entry.currentRouteFixes ?? entry.routeFixes).map(fix => fix.name);
    const eligibleAar = entry.preferentialArrivalRoutes.filter(aar => aar.eligible);
    if (eligibleAar.length === 1) {
      const aar = eligibleAar[0];
      if (currentFixNames.includes(aar.triggeredFix)) {
        return aar.amendment;
      }
    }
    return null;
  };

  const checkAdrReroutePending = (routes: PreferentialDepartureRoute[]) => {
    if (routes.length === 0) {
      return null;
    }
    const eligibleRoutes = routes.filter(adr => adr.eligible);
    if (eligibleRoutes.length > 0) {
      const eligibleRnavRoutes = eligibleRoutes.filter(adr => adr.rnavRequired);
      if (eligibleRnavRoutes.length > 0) {
        return eligibleRnavRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].amendment;
      }
      return eligibleRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].amendment;
    }
    return null;
  };
  const checkAdarReroutePending = (routes: PreferentialDepartureArrivalRoute[]) => {
    if (routes.length === 0) {
      return null;
    }
    const eligibleRoutes = routes.filter(adr => adr.eligible);
    if (eligibleRoutes.length > 0) {
      const eligibleRnavRoutes = eligibleRoutes.filter(adr => adr.rnavRequired);
      if (eligibleRnavRoutes.length > 0) {
        return eligibleRnavRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].route;
      }
      return eligibleRoutes.sort((u, v) => Number(u.order) - Number(v.order))[0].route;
    }
    return null;
  };

  const pendingAdr = checkAdrReroutePending(entry.preferentialDepartureRoutes);
  const pendingAdar = checkAdarReroutePending(entry.preferentialDepartureArrivalRoutes);
  const pendingAar = checkAarReroutePending();

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
          dispatch(deleteDepEntry(entry.aircraftId));
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
              {`${entry.equipment.split("/")[0]}/${entry.nasSuffix}`}
            </AircraftTypeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.depAlt}>
            <AltCol>
              <AltColDiv
                selected={isSelected(entry.aircraftId, DepRowField.ALT)}
                onMouseDown={event => dispatch(depAircraftSelect(event, entry.aircraftId, DepRowField.ALT, null, EdstWindow.ALTITUDE_MENU))}
              >
                {formatAltitude(entry.altitude)}
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
                  {/* className={`${((aarAvail && !onAar) || (adrAvail && !onAdr)) ? 'amendment-1' : ''} ${isSelected(entry.aircraftId, depRowFieldEnum.route) ? 'selected' : ''}`}> */}
                  {entry.departure}
                </RouteSpan>
                {pendingAdar && !onAdar && (
                  <RouteAmendmentSpan selected={isSelected(entry.aircraftId, DepRowField.ROUTE)}>{`[${pendingAdar}]`}</RouteAmendmentSpan>
                )}
                {!pendingAdar && pendingAdr && !onAdr && (
                  <RouteAmendmentSpan selected={isSelected(entry.aircraftId, DepRowField.ROUTE)}>{`[${pendingAdr}]`}</RouteAmendmentSpan>
                )}
                {route}
                {!pendingAdar && pendingAar && !onAar && (
                  <RouteAmendmentSpan selected={isSelected(entry.aircraftId, DepRowField.ROUTE)}>{`[${pendingAar}]`}</RouteAmendmentSpan>
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
