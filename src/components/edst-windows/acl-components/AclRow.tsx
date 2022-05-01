import React, {MouseEventHandler, useEffect, useMemo, useRef, useState} from 'react';
import {formatUtcMinutes, REMOVAL_TIMEOUT, removeDestFromRouteString} from "../../../lib";
import VCI from '../../../resources/images/VCI_v4.png';
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {LocalEdstEntryType} from "../../../types";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {deleteAclEntry, toggleSpa, updateEntry} from "../../../redux/slices/entriesSlice";
import {aclAselActionTriggerEnum, aclRowFieldEnum, menuEnum, windowEnum} from "../../../enums";
import {aselSelector, setInputFocused} from "../../../redux/slices/appSlice";
import {aclAircraftSelect} from "../../../redux/thunks/thunks";
import {amendEntryThunk} from "../../../redux/thunks/entriesThunks";
import {aclManualPostingSelector, toolsOptionsSelector} from "../../../redux/slices/aclSlice";
import {BodyRowContainerDiv, BodyRowDiv, FreeTextRow, InnerRow, InnerRow2} from '../../../styles/bodyStyles';
import {
  AclCol1,
  AircraftTypeCol, AltCol, AltColDiv, CodeCol, CoralBox,
  FidCol,
  HdgCol, HdgSpdSlashCol,
  HotBox,
  PointOutCol,
  RadioCol, RemarksBox, RouteAmendmentSpan, RouteCol, RouteDepSpan,
  RouteSpan,
  SpdCol,
  SpecialBox,
  VoiceTypeSpan
} from "./AclStyled";
import {edstFontBrown} from "../../../styles/colors";

const SPA_INDICATOR = '\u2303';

type AclRowProps = {
  key: string,
  entry: LocalEdstEntryType,
  index: number,
  anyHolding: boolean,
  hidden: aclRowFieldEnum[],
  altMouseDown: boolean,
}

export const AclRow: React.FC<AclRowProps> = (
  {
    entry,
    hidden,
    altMouseDown,
    index,
    anyHolding
  }) => {
  const asel = useAppSelector(aselSelector);
  const dispatch = useAppDispatch();
  const manualPosting = useAppSelector(aclManualPostingSelector);
  const toolOptions = useAppSelector(toolsOptionsSelector);
  const [aarAvail, setAarAvail] = useState(false);
  const [onAar, setOnAar] = useState(false);

  useEffect(() => (() => {
    if (freeTextContent !== (entry.free_text_content ?? '')) {
      dispatch(amendEntryThunk({cid: entry.cid, planData: {free_text_content: freeTextContent}}));
    } // eslint-disable-next-line
  }), []);

  useEffect(() => {
    const currentFixNames = (entry._route_data ?? entry.route_data).map(fix => fix.name);
    const aarAvail = (entry.aarList?.filter((aar) => aar.eligible && currentFixNames.includes(aar.tfix)) && !(entry._aarList?.filter((aar) => aar.onEligibleAar)));
    const onAar = !!entry._aarList?.filter((aar) => aar.onEligibleAar)?.length;
    setAarAvail(aarAvail ?? false);
    setOnAar(onAar);
  }, [entry._aarList, entry._route_data, entry.aarList, entry.route_data]);

  const holdData = useMemo(() => entry.hold_data, [entry.hold_data]);
  const route = useMemo(() => {
    let route = entry._route?.replace(/^\.+/, '') ?? entry.route;
    return removeDestFromRouteString(route.slice(0), entry.dest);
  }, [entry]);

  const now = new Date().getTime();

  const [displayScratchHdg, setDisplayScratchHdg] = useState(false);
  const [displayScratchSpd, setDisplayScratchSpd] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState(entry.free_text_content ?? '');
  const ref = useRef<HTMLDivElement | null>(null);

  // coral box indicates that aircraft is not RVSM capable but equipment says it is not RVSM capable
  const showCoralBox = (!entry.equipment.match(/[LZWH]/g) && Number(entry.altitude) > 280) && toolOptions.nonRvsmIndicator;

  const checkAarReroutePending = () => {
    const currentFixNames = (entry._route_data ?? entry.route_data).map(fix => fix.name);
    const eligibleAar = entry?._aarList?.filter((aar) => aar.eligible);
    if (eligibleAar?.length === 1) {
      const aar = eligibleAar[0];
      if (currentFixNames.includes(aar.tfix)) {
        return aar.aar_amendment_route_string;
      }
    }
    return null;
  };
  const pendingAar = checkAarReroutePending();

  const handleHotboxMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    if (event.button === 0) {
      dispatch(updateEntry({cid: entry.cid, data: {showFreeText: !entry.showFreeText}}));
      dispatch(amendEntryThunk({cid: entry.cid, planData: {free_text_content: freeTextContent}}));
    }
    if (event.button === 1) {
      dispatch(toggleSpa(entry.cid));
    }
    if (event.button === 2) {
      dispatch(updateEntry({cid: entry.cid, data: {aclHighlighted: !entry.aclHighlighted}}));
    }
  };

  const updateVci = () => {
    if (entry.vciStatus === -1 && manualPosting) {
      dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
    } else {
      if (entry.vciStatus < 1) {
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: entry.vciStatus + 1}}));
      } else {
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
      }
    }
  };

  const handleHoldClick = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        if (!entry.hold_data) {
          dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.hold, null, menuEnum.holdMenu));
        } else {
          dispatch(updateEntry({
            cid: entry.cid,
            data: {aclRouteDisplay: !entry.aclRouteDisplay ? 'hold_data' : null}
          }));
        }
        break;
      case 1:
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.hold, aclAselActionTriggerEnum.toggleHoldInfo));
        break;
      default:
        break;
    }
  };

  const handleRemarksClick = (event: React.MouseEvent) => {
    if (entry.vciStatus === -1 && !manualPosting) {
      dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
    }
    switch (event.button) {
      case 0:
        dispatch(updateEntry({
          cid: entry.cid, data: {
            aclRouteDisplay: !(entry.aclRouteDisplay === 'remarks') && entry.remarks.length > 0 ? 'remarks' : null,
            remarksChecked: true
          }
        }));
        break;
      case 2:
        dispatch(updateEntry({
          cid: entry.cid,
          data: {aclRouteDisplay: !(entry.aclRouteDisplay === 'raw_route') ? 'raw_route' : null}
        }));
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
          dispatch(deleteAclEntry(entry.cid));
        }
        break;
      default:
        if (!manualPosting && event.detail === 2 && entry.vciStatus < 0) {
          dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
        }
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.fid));
        break;
    }
  };

  const handleHeadingClick: MouseEventHandler = (event: React.MouseEvent & Event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.hdg, null, menuEnum.headingMenu));
        break;
      case 1:
        if (entry.scratchHdg && (displayScratchHdg || entry.hdg === null)) {
          let promotedHdg = 'LRH'.includes(entry.scratchHdg.slice(-1)) ? entry.scratchHdg : `H${entry.scratchHdg}`;
          dispatch(amendEntryThunk({cid: entry.cid, planData: {hdg: promotedHdg, scratchHdg: null}}));
        }
        break;
      case 2:
        dispatch(amendEntryThunk({
          cid: entry.cid,
          planData: {[(displayScratchHdg || !entry.hdg) && entry.scratchHdg ? 'scratchHdg' : 'hdg']: null}
        }));
        break;
      default:
        break;
    }
  };

  const handleSpeedClick: MouseEventHandler = (event: React.MouseEvent & Event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.spd, null, menuEnum.speedMenu));
        break;
      case 1:
        if (entry.scratchSpd && (displayScratchSpd || entry.spd === null)) {
          let promotedSpd = entry.scratchSpd.slice(0, 1) === 'M' ? entry.scratchSpd : `S${entry.scratchSpd}`;
          dispatch(amendEntryThunk({cid: entry.cid, planData: {spd: promotedSpd, scratchSpd: null}}));
        }
        break;
      case 2:
        dispatch(amendEntryThunk({
          cid: entry.cid,
          planData: {[(displayScratchSpd || !entry.spd) && entry.scratchSpd ? 'scratchSpd' : 'spd']: null}
        }));
        break;
      default:
        break;
    }
  };

  const isSelected = (cid: string, field: aclRowFieldEnum): boolean => {
    return asel?.window === windowEnum.acl && asel?.cid === cid && asel?.field === field;
  };

  return (<BodyRowContainerDiv separator={index % 3 === 2}
                               key={`acl-row-container-${entry.cid}`}
                               onContextMenu={(event) => event.preventDefault()}>
    <BodyRowDiv pendingRemoval={(now - (entry.pendingRemoval ?? now) > REMOVAL_TIMEOUT)}>
      <EdstTooltip title={Tooltips.aclNAndVciBtn}>
        <RadioCol hoverGreen={entry.vciStatus === 1}
                  onMouseDown={updateVci}>
          {entry.vciStatus === -1 && 'N'}{entry.vciStatus === 1 && <img src={VCI} alt="wifi-symbol"/>}
        </RadioCol>
      </EdstTooltip>
      <AclCol1 border={true}/>
      <AclCol1 border={true}/>
      <AclCol1 border={true}/>
      <SpecialBox disabled={true}/>
      <SpecialBox disabled={true}/>
      <InnerRow highlight={entry.aclHighlighted} ref={ref}
                style={{minWidth: entry.showFreeText ? '1200px' : 0}}
      >
        <EdstTooltip title={Tooltips.aclFlightId} onMouseDown={handleFidClick}>
          <FidCol hover={true} selected={isSelected(entry.cid, aclRowFieldEnum.fid)}>
            {entry.cid} {entry.callsign}
            <VoiceTypeSpan>
              {entry.voiceType === 'r' ? '/R' : entry.voiceType === 't' ? '/T' : ''}
            </VoiceTypeSpan>
          </FidCol>
        </EdstTooltip>
        <PointOutCol/>
        <SpecialBox disabled={!entry.spa}>
          {entry.spa && SPA_INDICATOR}
        </SpecialBox>
        <EdstTooltip title={Tooltips.aclHotbox}>
          <HotBox onMouseDown={handleHotboxMouseDown}>
            {freeTextContent && '*'}
          </HotBox>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclType}>
          <AircraftTypeCol contentHidden={hidden.includes(aclRowFieldEnum.type)} hover={true}
                           selected={isSelected(entry.cid, aclRowFieldEnum.type)}
                           onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.type))}
          >
            {`${entry.type}/${entry.equipment}`}
          </AircraftTypeCol>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclAlt}>
          <AltCol>
            <AltColDiv interim={!!entry.interim} headerMouseDown={altMouseDown}
                       selected={isSelected(entry.cid, aclRowFieldEnum.alt)}
                       onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.alt, null, menuEnum.altitudeMenu))}
            >
              {entry.altitude}{entry.interim && `T${entry.interim}`}
            </AltColDiv>
            {showCoralBox && <CoralBox/>}
          </AltCol>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclCode}>
          <CodeCol contentHidden={hidden.includes(aclRowFieldEnum.code)} hover={true}
                   selected={isSelected(entry.cid, aclRowFieldEnum.code)}
                   onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.code))}
          >
            {entry.beacon}
          </CodeCol>
        </EdstTooltip>
        <SpecialBox onMouseDown={() => setDisplayScratchHdg(!displayScratchHdg)}
                    disabled={!(entry.hdg && entry.scratchHdg)}>
          {entry.hdg && entry.scratchHdg && '*'}
        </SpecialBox>
        <EdstTooltip title={Tooltips.aclHdg}>
          <HdgCol hover={true} contentHidden={hidden.includes(aclRowFieldEnum.hdg)}
                  selected={isSelected(entry.cid, aclRowFieldEnum.hdg)} onMouseDown={handleHeadingClick}
                  scratchpad={!!entry.scratchHdg && (displayScratchHdg || entry.hdg === null)}
          >
            {(entry.scratchHdg && (displayScratchHdg || entry.hdg === null)) ? entry.scratchHdg : entry.hdg}
          </HdgCol>
        </EdstTooltip>
        <HdgSpdSlashCol>
          /
        </HdgSpdSlashCol>
        <EdstTooltip title={Tooltips.aclSpd}>
          <SpdCol hover={true} contentHidden={hidden.includes(aclRowFieldEnum.spd)}
                  selected={isSelected(entry.cid, aclRowFieldEnum.spd)} onMouseDown={handleSpeedClick}
                  scratchpad={!!entry.scratchSpd && (displayScratchSpd || entry.spd === null)}
          >
            {(entry.scratchSpd && (displayScratchSpd || entry.spd === null)) ? entry.scratchSpd : entry.spd}
          </SpdCol>
        </EdstTooltip>
        <SpecialBox onMouseDown={() => setDisplayScratchSpd(!displayScratchSpd)}
                    disabled={!(entry.spd && entry.scratchSpd)}>
          {entry.spd && entry.scratchSpd && '*'}
        </SpecialBox>
        <SpecialBox disabled={true}/>
        <SpecialBox color={edstFontBrown} selected={isSelected(entry.cid, aclRowFieldEnum.hold)}
                    onMouseDown={handleHoldClick}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      if (entry?.hold_data) {
                        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.hold, null, menuEnum.cancelHoldMenu));
                      }
                    }}
                    disabled={!anyHolding}
        >
          {entry.hold_data ? 'H' : ''}
        </SpecialBox>
        <SpecialBox disabled={true}/>
        <EdstTooltip title={Tooltips.aclRemarksBtn}>
          <RemarksBox unchecked={!entry.remarksChecked && entry.remarks.length > 0}
                      onMouseDown={handleRemarksClick}
          >
            {entry.remarks.length > 0 && '*'}
          </RemarksBox>
        </EdstTooltip>
        <SpecialBox disabled={true}/>
        <SpecialBox disabled={true}/>
        <EdstTooltip title={Tooltips.aclRoute}>
          <RouteCol hover={true} selected={isSelected(entry.cid, aclRowFieldEnum.route)}
                    onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.route, null, menuEnum.routeMenu))}
          >
            {entry.aclRouteDisplay === 'hold_data' && holdData &&
              `${holdData.hold_fix} ${holdData.hold_direction} ${holdData.turns} ${holdData.leg_length} EFC ${formatUtcMinutes(holdData.efc)}`}
            {entry.aclRouteDisplay === 'remarks' && <span>{entry.flightplan.remarks}</span>}
            {entry.aclRouteDisplay === 'raw_route' && <span>{entry.flightplan.route}</span>}
            {!entry.aclRouteDisplay && <RouteSpan padding="0 2px">
                <RouteDepSpan amendmentPending={aarAvail && !onAar}
                              selected={isSelected(entry.cid, aclRowFieldEnum.route)}>
                  {entry.dep}
                </RouteDepSpan>
                ./.
              {entry.cleared_direct?.fix && route.startsWith(entry.cleared_direct?.fix) && entry.cleared_direct?.frd + '..'}
              {/*{entry.reference_fix ? computeFrd(entry.reference_fix) + '.' : ''}*/}
              {route}{!route.endsWith('.') && route.length > 0 && `.`}
              {pendingAar && !onAar &&
                  <RouteAmendmentSpan selected={isSelected(entry.cid, aclRowFieldEnum.route)}>
                    {`[${pendingAar}]`}
                  </RouteAmendmentSpan>}
              {entry.dest}
            </RouteSpan>}
          </RouteCol>
        </EdstTooltip>
      </InnerRow>
    </BodyRowDiv>
    {entry.showFreeText && <BodyRowDiv>
        <RadioCol disabled={true}/>
        <AclCol1/>
        <AclCol1/>
        <AclCol1/>
        <SpecialBox disabled={true}/>
        <SpecialBox disabled={true}/>
        <InnerRow2 highlight={entry.aclHighlighted} minWidth={Math.max(1200, ref?.current?.clientWidth ?? 0)}>
            <FreeTextRow marginLeft={214}>
                <input
                    onFocus={() => dispatch(setInputFocused(true))}
                    onBlur={() => dispatch(setInputFocused(false))}
                    value={freeTextContent}
                    onChange={(event) => setFreeTextContent(event.target.value.toUpperCase())}/>
            </FreeTextRow>
        </InnerRow2>
    </BodyRowDiv>}
  </BodyRowContainerDiv>);
};
