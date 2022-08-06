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
import { AclCol1, CoralBox, HdgCol, HdgSpdSlashCol, PointOutCol, RadioCol, RemarksBox, SpdCol, VoiceTypeSpan } from "./AclStyled";
import { edstFontBrown } from "../../../styles/colors";
import { EdstEntry } from "../../../types/edstEntry";
import { aclAircraftSelect } from "../../../redux/thunks/aircraftSelect";
import {
  AircraftTypeCol,
  AltCol,
  AltColDiv,
  CodeCol,
  FidCol,
  HotBox,
  RouteCol,
  RouteDepAirportSpan,
  RouteSpan,
  SpecialBox
} from "../../../styles/sharedColumns";
import { EdstWindow } from "../../../enums/edstWindow";
import { AclRowField } from "../../../enums/acl/aclRowField";
import { AclRouteDisplayOption } from "../../../enums/aclRouteDisplayOption";
import { HoldDirectionValues } from "../../../enums/hold/holdDirectionValues";
import { HoldTurnDirectionValues } from "../../../enums/hold/turnDirection";

const SPA_INDICATOR = "\u2303";

type AclRowProps = {
  entry: EdstEntry;
  index: number;
  anyHolding: boolean;
  hidden: AclRowField[];
  altMouseDown: boolean;
};

/**
 * Single ACL row
 * @param entry
 * @param hidden array of ACL fields hidden by the user
 * @param altMouseDown boolean indicating where mouse is pressed on the ACL header Alt column
 * @param index row index
 * @param anyHolding boolean whether any aircraft is currently in a hold, an extra column will be displayed if true
 */
export const AclRow = ({ entry, hidden, altMouseDown, index, anyHolding }: AclRowProps) => {
  const asel = useRootSelector(aselSelector);
  const dispatch = useRootDispatch();
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const toolOptions = useRootSelector(toolsOptionsSelector);
  const [parAvail, setParAvail] = useState(false);
  const [onPar, setOnPar] = useState(false);
  const [displayScratchHdg, setDisplayScratchHdg] = useState(false);
  const [displayScratchSpd, setDisplayScratchSpd] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState(entry.freeTextContent ?? "");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentFixNames = (entry.currentRouteFixes ?? entry.routeFixes).map(fix => fix.name);
    const parAvail =
      entry.preferentialArrivalRoutes.filter(
        par => par.eligible && currentFixNames.includes(par.triggeredFix) && entry.formattedRoute.includes(par.amendment)
      ).length > 0;
    setParAvail(parAvail);
    setOnPar(onPar);
  }, [entry.currentRouteFixes, entry.preferentialArrivalRoutes, entry.routeFixes]);

  const { holdAnnotations } = entry;
  const route = useMemo(() => {
    const route = entry.currentRoute.replace(/^\.+/, "") ?? entry.formattedRoute;
    return removeDestFromRouteString(route.slice(0), entry.destination);
  }, [entry]);

  const now = new Date().getTime();

  // coral box indicates that aircraft is not RVSM capable but equipment says it is not RVSM approved
  const showCoralBox = !entry.faaEquipmentSuffix.match(/[LZWH]/g) && Number(entry.altitude) > 280 && toolOptions.nonRvsmIndicator;

  // TODO: move this to the route menu
  // const checkParReroutePending = () => {
  //   const currentFixNames = (entry.currentRouteFixes ?? entry.routeFixes).map(fix => fix.name);
  //   const eligiblePar = entry?.preferentialArrivalRoutes?.filter(par => par.eligible);
  //   if (eligiblePar?.length === 1) {
  //     const par = eligiblePar[0];
  //     if (currentFixNames.includes(par.triggeredFix) && !entry.formattedRoute.includes(par.amendment)) {
  //       return par.amendment;
  //     }
  //   }
  //   return null;
  // };
  // const pendingPar = checkParReroutePending();

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
      dispatch(
        updateEntry({
          aircraftId: entry.aircraftId,
          data: { vciStatus: (entry.vciStatus + 1) as EdstEntry["vciStatus"] }
        })
      );
    } else {
      dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { vciStatus: 0 } }));
    }
  };

  const handleHoldClick = (event: React.MouseEvent) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        if (!entry.holdAnnotations) {
          dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.HOLD, null, EdstWindow.HOLD_MENU));
        } else {
          dispatch(
            updateEntry({
              aircraftId: entry.aircraftId,
              data: { aclRouteDisplay: !entry.aclRouteDisplay ? AclRouteDisplayOption.holdAnnotations : null }
            })
          );
        }
        break;
      case 1:
        dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.HOLD, null, EdstWindow.HOLD_MENU));
        break;
      case 2:
        if (entry?.holdAnnotations) {
          dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.HOLD, null, EdstWindow.CANCEL_HOLD_MENU));
        }
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
        if (entry.scratchpadHeading && (displayScratchHdg || entry.assignedHeading === null)) {
          const promotedHdg = "LRH".includes(entry.scratchpadHeading.slice(-1)) ? entry.scratchpadHeading : `H${entry.scratchpadHeading}`;
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
        if (entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null)) {
          const promotedSpd = entry.scratchpadSpeed.slice(0, 1) === "M" ? entry.scratchpadSpeed : `S${entry.scratchpadSpeed}`;
        }
        break;
      case 2:
        break;
      default:
        break;
    }
  };

  const handleRouteClicked = (event: React.MouseEvent) => {
    if (entry.aclRouteDisplay === AclRouteDisplayOption.holdAnnotations) {
      dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.ROUTE, null, EdstWindow.HOLD_MENU));
    } else {
      dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.ROUTE, null, EdstWindow.ROUTE_MENU));
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
        <InnerRow highlight={entry.aclHighlighted} ref={ref} style={{ minWidth: entry.showFreeText ? "1200px" : 0 }}>
          <EdstTooltip title={Tooltips.aclFlightId} onMouseDown={handleFidClick}>
            <FidCol hover selected={isSelected(entry.aircraftId, AclRowField.FID)}>
              {entry.cid} {entry.aircraftId}
              {/* eslint-disable-next-line no-nested-ternary */}
              <VoiceTypeSpan>{entry.voiceType === "r" ? "/R" : entry.voiceType === "t" ? "/T" : ""}</VoiceTypeSpan>
            </FidCol>
          </EdstTooltip>
          <PointOutCol />
          {toolOptions.displayCoordinationColumn && <SpecialBox disabled />}
          <SpecialBox disabled={!entry.spa}>{entry.spa && SPA_INDICATOR}</SpecialBox>
          <EdstTooltip title={Tooltips.aclHotbox}>
            <HotBox onMouseDown={handleHotboxMouseDown}>{freeTextContent && "*"}</HotBox>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclType}>
            <AircraftTypeCol
              visibilityHidden={hidden.includes(AclRowField.TYPE)}
              hover
              selected={isSelected(entry.aircraftId, AclRowField.TYPE)}
              onMouseDown={(event: React.MouseEvent) => dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.TYPE))}
            >
              {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
            </AircraftTypeCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclAlt}>
            <AltCol>
              <AltColDiv
                headerMouseDown={altMouseDown}
                selected={isSelected(entry.aircraftId, AclRowField.ALT)}
                onMouseDown={(event: React.MouseEvent) =>
                  dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.ALT, null, EdstWindow.ALTITUDE_MENU))
                }
              >
                {formatAltitude(entry.altitude)}
                {entry.interimAltitude && `T${entry.interimAltitude}`}
              </AltColDiv>
              {showCoralBox && <CoralBox />}
            </AltCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclCode}>
            <CodeCol
              visibilityHidden={hidden.includes(AclRowField.CODE)}
              hover
              selected={isSelected(entry.aircraftId, AclRowField.CODE)}
              onMouseDown={(event: React.MouseEvent) => dispatch(aclAircraftSelect(event, entry.aircraftId, AclRowField.CODE))}
            >
              {convertBeaconCodeToString(entry.assignedBeaconCode)}
            </CodeCol>
          </EdstTooltip>
          <SpecialBox onMouseDown={() => setDisplayScratchHdg(!displayScratchHdg)} disabled={!(entry.assignedHeading && entry.scratchpadHeading)}>
            {entry.assignedHeading && entry.scratchpadHeading && "*"}
          </SpecialBox>
          <EdstTooltip title={Tooltips.aclHdg}>
            <HdgCol
              hover
              visibilityHidden={hidden.includes(AclRowField.HDG)}
              selected={isSelected(entry.aircraftId, AclRowField.HDG)}
              onMouseDown={handleHeadingClick}
              scratchpad={!!entry.scratchpadHeading && (displayScratchHdg || entry.assignedHeading === null)}
            >
              {entry.scratchpadHeading && (displayScratchHdg || entry.assignedHeading === null) ? entry.scratchpadHeading : entry.assignedHeading}
            </HdgCol>
          </EdstTooltip>
          <HdgSpdSlashCol>/</HdgSpdSlashCol>
          <EdstTooltip title={Tooltips.aclSpd}>
            <SpdCol
              hover
              visibilityHidden={hidden.includes(AclRowField.SPD)}
              selected={isSelected(entry.aircraftId, AclRowField.SPD)}
              onMouseDown={handleSpeedClick}
              scratchpad={!!entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null)}
            >
              {entry.scratchpadSpeed && (displayScratchSpd || entry.assignedSpeed === null) ? entry.scratchpadSpeed : entry.assignedSpeed}
            </SpdCol>
          </EdstTooltip>
          <SpecialBox onMouseDown={() => setDisplayScratchSpd(!displayScratchSpd)} disabled={!(entry.assignedSpeed && entry.scratchpadSpeed)}>
            {entry.assignedSpeed && entry.scratchpadSpeed && "*"}
          </SpecialBox>
          <SpecialBox disabled />
          {anyHolding && (
            <SpecialBox color={edstFontBrown} selected={isSelected(entry.aircraftId, AclRowField.HOLD)} onMouseDown={handleHoldClick}>
              {entry.holdAnnotations ? "H" : ""}
            </SpecialBox>
          )}
          <EdstTooltip title={Tooltips.aclRemarksBtn}>
            <RemarksBox unchecked={!entry.remarksChecked && entry.remarks.length > 0} onMouseDown={handleRemarksClick}>
              {entry.remarks.length > 0 && "*"}
            </RemarksBox>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclRoute}>
            <RouteCol hover selected={isSelected(entry.aircraftId, AclRowField.ROUTE)} onMouseDown={handleRouteClicked}>
              <RouteSpan padding="0 2px">
                {entry.aclRouteDisplay === AclRouteDisplayOption.holdAnnotations &&
                  holdAnnotations &&
                  `${holdAnnotations.fix ?? "PP"} ${HoldDirectionValues[holdAnnotations.direction]} ` +
                    `${HoldTurnDirectionValues[holdAnnotations.turns]} ` +
                    `${holdAnnotations.legLength ?? "STD"}` +
                    // eslint-disable-next-line no-nested-ternary
                    `${holdAnnotations.legLength ? (holdAnnotations.legLengthInNm ? "NM" : "Minutes") : ""} EFC ${formatUtcMinutes(
                      holdAnnotations.efc
                    )}`}
                {entry.aclRouteDisplay === AclRouteDisplayOption.remarks && <span>{entry.remarks}</span>}
                {entry.aclRouteDisplay === AclRouteDisplayOption.rawRoute && <span>{entry.route}</span>}
                {!entry.aclRouteDisplay && (
                  <>
                    <RouteDepAirportSpan amendmentPending={parAvail && !onPar} selected={isSelected(entry.aircraftId, AclRowField.ROUTE)}>
                      {entry.departure}
                    </RouteDepAirportSpan>
                    ./.
                    {route}
                    {!route.endsWith(".") && route.length > 0 && `.`}
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
          <AclCol1 />
          <AclCol1 />
          <AclCol1 />
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
