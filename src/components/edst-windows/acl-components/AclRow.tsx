import React, { MouseEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { convertBeaconCodeToString, formatAltitude, formatUtcMinutes, REMOVAL_TIMEOUT, removeDestFromRouteString } from "../../../lib";
import VCI from "../../../resources/images/VCI_v4.png";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { rmvEntryFromAcl, toggleSpa, updateEntry } from "../../../redux/slices/entrySlice";
import { aselSelector } from "../../../redux/slices/appSlice";
import { aclManualPostingSelector, toolsOptionsSelector } from "../../../redux/slices/aclSlice";
import { BodyRowContainerDiv, BodyRowDiv, FreeTextRow, InnerRow, InnerRow2 } from "../../../styles/bodyStyles";
import {
  AclCol1,
  AircraftTypeCol,
  AltCol,
  AltColDiv,
  CodeCol,
  CoralBox,
  FidCol,
  HdgCol,
  HdgSpdSlashCol,
  HotBox,
  PointOutCol,
  RadioCol,
  RemarksBox,
  RouteAmendmentSpan,
  RouteCol,
  RouteDepSpan,
  RouteSpan,
  SpdCol,
  SpecialBox,
  VoiceTypeSpan
} from "./AclStyled";
import { edstFontBrown } from "../../../styles/colors";
import { AclAselActionTrigger, AclRowField, EdstWindow } from "../../../namespaces";
import { EdstEntry } from "../../../types/edstEntry";
import { aclAircraftSelect } from "../../../redux/thunks/aircraftSelect";
import { AclRouteDisplayOption } from "../../../types/localVEdstEntry";

const SPA_INDICATOR = "\u2303";

type AclRowProps = {
  entry: EdstEntry;
  index: number;
  anyHolding: boolean;
  hidden: AclRowField[];
  altMouseDown: boolean;
};

export const AclRow: React.FC<AclRowProps> = ({ entry, hidden, altMouseDown, index, anyHolding }) => {
  const asel = useRootSelector(aselSelector);
  const dispatch = useRootDispatch();
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const toolOptions = useRootSelector(toolsOptionsSelector);
  const [parAvail, setParAvail] = useState(false);
  const [onPar, setOnPar] = useState(false);

  useEffect(() => {
    const currentFixNames = (entry.currentRouteFixes ?? entry.routeFixes).map(fix => fix.name);
    const parAvail = !!entry.preferentialArrivalRoutes?.filter(
      par => par.eligible && currentFixNames.includes(par.triggeredFix) && entry.formattedRoute.includes(par.amendment)
    );
    setParAvail(parAvail ?? false);
    setOnPar(onPar);
  }, [entry.currentRouteFixes, entry.preferentialArrivalRoutes, entry.routeFixes]);

  const { holdData } = entry;
  const route = useMemo(() => {
    const route = entry.currentRoute?.replace(/^\.+/, "") ?? entry.formattedRoute;
    return removeDestFromRouteString(route.slice(0), entry.destination);
  }, [entry]);

  const now = new Date().getTime();

  const [displayScratchHdg, setDisplayScratchHdg] = useState(false);
  const [displayScratchSpd, setDisplayScratchSpd] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent ?? "");
  const ref = useRef<HTMLDivElement | null>(null);

  // coral box indicates that aircraft is not RVSM capable but equipment says it is not RVSM approved
  const showCoralBox = !entry.faaEquipmentSuffix.match(/[LZWH]/g) && Number(entry.altitude) > 280 && toolOptions.nonRvsmIndicator;

  const checkParReroutePending = () => {
    const currentFixNames = (entry.currentRouteFixes ?? entry.routeFixes).map(fix => fix.name);
    const eligiblePar = entry?.preferentialArrivalRoutes?.filter(par => par.eligible);
    if (eligiblePar?.length === 1) {
      const par = eligiblePar[0];
      if (currentFixNames.includes(par.triggeredFix) && !entry.formattedRoute.includes(par.amendment)) {
        return par.amendment;
      }
    }
    return null;
  };
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
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { aclHighlighted: !entry.aclHighlighted } }));
    }
  };

  const updateVci = () => {
    if (entry.vciStatus === -1 && manualPosting) {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { vciStatus: 0 } }));
    } else if (entry.vciStatus < 1) {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { vciStatus: entry.vciStatus + 1 } }));
    } else {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { vciStatus: 0 } }));
    }
  };

  const handleHoldClick = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        if (!entry.holdData) {
          dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.HOLD, null, EdstWindow.HOLD_MENU));
        } else {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { aclRouteDisplay: !entry.aclRouteDisplay ? AclRouteDisplayOption.holdData : null }
            })
          );
        }
        break;
      case 1:
        dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.HOLD, AclAselActionTrigger.TOGGLE_HOLD_INFO));
        break;
      default:
        break;
    }
  };

  const handleRemarksClick = (event: React.MouseEvent) => {
    if (entry.vciStatus === -1 && !manualPosting) {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { vciStatus: 0 } }));
    }
    switch (event.button) {
      case 0:
        dispatch(
          updateEntry({
            aircraftId: entry.aircraftId,
            data: {
              aclRouteDisplay:
                !(entry.aclRouteDisplay === AclRouteDisplayOption.remarks) && entry.remarks.length > 0 ? AclRouteDisplayOption.remarks : null,
              remarksChecked: true
            }
          })
        );
        break;
      case 2:
        dispatch(
          updateEntry({
            aircraftId: entry.aircraftId,
            data: { aclRouteDisplay: !(entry.aclRouteDisplay === AclRouteDisplayOption.rawRoute) ? AclRouteDisplayOption.rawRoute : null }
          })
        );
        break;
      default:
        break;
    }
  };

  const handleFidClick: MouseEventHandler = (event: React.MouseEvent & MouseEvent) => {
    const now = new Date().getTime();
    switch (event.button) {
      case 2:
        if (now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT) {
          dispatch(rmvEntryFromAcl(entry.aircraftId));
        }
        break;
      default:
        if (!manualPosting && event.detail === 2 && entry.vciStatus < 0) {
          dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { vciStatus: 0 } }));
        }
        dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.FID));
        break;
    }
  };

  const handleHeadingClick: MouseEventHandler = (event: React.MouseEvent & Event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.HDG, null, EdstWindow.HEADING_MENU));
        break;
      case 1:
        if (entry.scratchHdg && (displayScratchHdg || entry.assignedHeading === null)) {
          const promotedHdg = "LRH".includes(entry.scratchHdg.slice(-1)) ? entry.scratchHdg : `H${entry.scratchHdg}`;
        }
        break;
      case 2:
        break;
      default:
        break;
    }
  };

  const handleSpeedClick: MouseEventHandler = (event: React.MouseEvent & Event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.SPD, null, EdstWindow.SPEED_MENU));
        break;
      case 1:
        if (entry.scratchSpd && (displayScratchSpd || entry.assignedSpeed === null)) {
          const promotedSpd = entry.scratchSpd.slice(0, 1) === "M" ? entry.scratchSpd : `S${entry.scratchSpd}`;
        }
        break;
      case 2:
        break;
      default:
        break;
    }
  };

  const isSelected = (aircraftId: string, field: AclRowField): boolean => {
    return asel?.window === EdstWindow.ACL && asel?.aircraftId === aircraftId && asel?.field === field;
  };

  // console.log(entry.aircraftId, entry.preferentialArrivalRoutes);

  return (
    <BodyRowContainerDiv separator={index % 3 === 2} key={`acl-row-container-${entry.aircraftId}`} onContextMenu={event => event.preventDefault()}>
      <BodyRowDiv pendingRemoval={now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT}>
        <EdstTooltip title={Tooltips.aclNAndVciBtn}>
          <RadioCol hoverGreen={entry.vciStatus === 1} onMouseDown={updateVci}>
            {entry.vciStatus === -1 && "N"}
            {entry.vciStatus === 1 && <img src={VCI} alt="wifi-symbol" />}
          </RadioCol>
        </EdstTooltip>
        <AclCol1 border />
        <AclCol1 border />
        <AclCol1 border />
        <SpecialBox disabled />
        <SpecialBox disabled />
        <InnerRow highlight={entry.aclHighlighted} ref={ref} style={{ minWidth: entry.showFreeText ? "1200px" : 0 }}>
          <EdstTooltip title={Tooltips.aclFlightId} onMouseDown={handleFidClick}>
            <FidCol hover selected={isSelected(entry.aircraftId, AclRowField.FID)}>
              {entry.cid} {entry.aircraftId}
              {/* eslint-disable-next-line no-nested-ternary */}
              <VoiceTypeSpan>{entry.voiceType === "r" ? "/R" : entry.voiceType === "t" ? "/T" : ""}</VoiceTypeSpan>
            </FidCol>
          </EdstTooltip>
          <PointOutCol />
          <SpecialBox disabled={!entry.spa}>{entry.spa && SPA_INDICATOR}</SpecialBox>
          <EdstTooltip title={Tooltips.aclHotbox}>
            <HotBox onMouseDown={handleHotboxMouseDown}>{freeTextContent && "*"}</HotBox>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclType}>
            <AircraftTypeCol
              contentHidden={hidden.includes(AclRowField.TYPE)}
              hover
              selected={isSelected(entry.aircraftId, AclRowField.TYPE)}
              onMouseDown={event => dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.TYPE))}
            >
              {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
            </AircraftTypeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclAlt}>
            <AltCol>
              <AltColDiv
                headerMouseDown={altMouseDown}
                selected={isSelected(entry.aircraftId, AclRowField.ALT)}
                onMouseDown={event => dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.ALT, null, EdstWindow.ALTITUDE_MENU))}
              >
                {formatAltitude(entry.altitude)}
                {entry.interimAltitude && `T${entry.interimAltitude}`}
              </AltColDiv>
              {showCoralBox && <CoralBox />}
            </AltCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclCode}>
            <CodeCol
              contentHidden={hidden.includes(AclRowField.CODE)}
              hover
              selected={isSelected(entry.aircraftId, AclRowField.CODE)}
              onMouseDown={event => dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.CODE))}
            >
              {convertBeaconCodeToString(entry.assignedBeaconCode)}
            </CodeCol>
          </EdstTooltip>
          <SpecialBox onMouseDown={() => setDisplayScratchHdg(!displayScratchHdg)} disabled={!(entry.assignedHeading && entry.scratchHdg)}>
            {entry.assignedHeading && entry.scratchHdg && "*"}
          </SpecialBox>
          <EdstTooltip title={Tooltips.aclHdg}>
            <HdgCol
              hover
              contentHidden={hidden.includes(AclRowField.HDG)}
              selected={isSelected(entry.aircraftId, AclRowField.HDG)}
              onMouseDown={handleHeadingClick}
              scratchpad={!!entry.scratchHdg && (displayScratchHdg || entry.assignedHeading === null)}
            >
              {entry.scratchHdg && (displayScratchHdg || entry.assignedHeading === null) ? entry.scratchHdg : entry.assignedHeading}
            </HdgCol>
          </EdstTooltip>
          <HdgSpdSlashCol>/</HdgSpdSlashCol>
          <EdstTooltip title={Tooltips.aclSpd}>
            <SpdCol
              hover
              contentHidden={hidden.includes(AclRowField.SPD)}
              selected={isSelected(entry.aircraftId, AclRowField.SPD)}
              onMouseDown={handleSpeedClick}
              scratchpad={!!entry.scratchSpd && (displayScratchSpd || entry.assignedSpeed === null)}
            >
              {entry.scratchSpd && (displayScratchSpd || entry.assignedSpeed === null) ? entry.scratchSpd : entry.assignedSpeed}
            </SpdCol>
          </EdstTooltip>
          <SpecialBox onMouseDown={() => setDisplayScratchSpd(!displayScratchSpd)} disabled={!(entry.assignedSpeed && entry.scratchSpd)}>
            {entry.assignedSpeed && entry.scratchSpd && "*"}
          </SpecialBox>
          <SpecialBox disabled />
          <SpecialBox
            color={edstFontBrown}
            selected={isSelected(entry.aircraftId, AclRowField.HOLD)}
            onMouseDown={handleHoldClick}
            onContextMenu={event => {
              event.preventDefault();
              if (entry?.holdData) {
                dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.HOLD, null, EdstWindow.CANCEL_HOLD_MENU));
              }
            }}
            disabled={!anyHolding}
          >
            {entry.holdData ? "H" : ""}
          </SpecialBox>
          <SpecialBox disabled />
          <EdstTooltip title={Tooltips.aclRemarksBtn}>
            <RemarksBox unchecked={!entry.remarksChecked && entry.remarks.length > 0} onMouseDown={handleRemarksClick}>
              {entry.remarks.length > 0 && "*"}
            </RemarksBox>
          </EdstTooltip>
          <SpecialBox disabled />
          <SpecialBox disabled />
          <EdstTooltip title={Tooltips.aclRoute}>
            <RouteCol
              hover
              selected={isSelected(entry.aircraftId, AclRowField.ROUTE)}
              onMouseDown={event => dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.ROUTE, null, EdstWindow.ROUTE_MENU))}
            >
              {entry.aclRouteDisplay === AclRouteDisplayOption.rawRoute &&
                holdData &&
                `${holdData.hold_fix} ${holdData.hold_direction} ${holdData.turns} ${holdData.leg_length} EFC ${formatUtcMinutes(holdData.efc)}`}
              {entry.aclRouteDisplay === AclRouteDisplayOption.remarks && <span>{entry.remarks}</span>}
              {entry.aclRouteDisplay === AclRouteDisplayOption.rawRoute && <span>{entry.route}</span>}
              {!entry.aclRouteDisplay && (
                <RouteSpan padding="0 2px">
                  <RouteDepSpan amendmentPending={parAvail && !onPar} selected={isSelected(entry.aircraftId, AclRowField.ROUTE)}>
                    {entry.departure}
                  </RouteDepSpan>
                  ./.
                  {/* {entry.reference_fix ? computeFrd(entry.reference_fix) + '.' : ''} */}
                  {route}
                  {!route.endsWith(".") && route.length > 0 && `.`}
                  {pendingPar && !onPar && (
                    <RouteAmendmentSpan selected={isSelected(entry.aircraftId, AclRowField.ROUTE)}>{`[${pendingPar}]`}</RouteAmendmentSpan>
                  )}
                  {entry.destination}
                </RouteSpan>
              )}
            </RouteCol>
          </EdstTooltip>
        </InnerRow>
      </BodyRowDiv>
      {entry.showFreeText && (
        <BodyRowDiv>
          <RadioCol disabled />
          <AclCol1 />
          <AclCol1 />
          <AclCol1 />
          <SpecialBox disabled />
          <SpecialBox disabled />
          <InnerRow2 highlight={entry.aclHighlighted} minWidth={Math.max(1200, ref?.current?.clientWidth ?? 0)}>
            <FreeTextRow marginLeft={214}>
              <input value={freeTextContent} onChange={event => setFreeTextContent(event.target.value)} />
            </FreeTextRow>
          </InnerRow2>
        </BodyRowDiv>
      )}
    </BodyRowContainerDiv>
  );
};
