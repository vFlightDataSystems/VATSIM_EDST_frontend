import React, {MouseEventHandler, useEffect, useRef, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {formatUtcMinutes, REMOVAL_TIMEOUT, removeDestFromRouteString} from "../../../lib";
import VCI from '../../../css/images/VCI_v4.png';
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {EdstEntryType} from "../../../types";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {deleteAclEntry, toggleSpa, updateEntry} from "../../../redux/slices/entriesSlice";
import {aclAselActionTriggerEnum, aclRowFieldEnum, windowEnum} from "../../../enums";
import {aselSelector, setInputFocused} from "../../../redux/slices/appSlice";
import {aclAircraftSelect} from "../../../redux/thunks/thunks";
import {amendEntryThunk} from "../../../redux/thunks/entriesThunks";

const SPA_INDICATOR = '^';

type AclRowProps = {
  key: string,
  entry: EdstEntryType,
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
  const manualPosting = useAppSelector((state) => state.acl.manualPosting);
  // if (entry.aar_list === undefined) {
  //   dispatch(fetchAarData(entry.cid));
  // }

  const holdData = entry.hold_data;
  const now = new Date().getTime();
  let route = entry._route?.replace(/^\.+/, '') ?? entry.route;
  route = removeDestFromRouteString(route.slice(0), entry.dest);

  const [displayScratchHdg, setDisplayScratchHdg] = useState(false);
  const [displayScratchSpd, setDisplayScratchSpd] = useState(false);
  const [freeTextContent, setFreeTextContent] = useState(entry.free_text_content ?? '');
  const ref = useRef<HTMLDivElement | null>(null);

  const currentFixNames = (entry._route_data ?? entry.route_data).map(fix => fix.name);
  const aarAvail = (entry.aar_list?.filter((aar) => aar.eligible && currentFixNames.includes(aar.tfix)) && !(entry._aar_list?.filter((aar) => aar.onEligibleAar)));
  const onAar = !!entry._aar_list?.filter((aar) => aar.onEligibleAar);

  const checkAarReroutePending = () => {
    const currentFixNames = (entry._route_data ?? entry.route_data).map(fix => fix.name);
    const eligibleAar = entry?._aar_list?.filter((aar) => aar.eligible);
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
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 1}}));
      } else {
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
      }
    }
  };

  useEffect(() => (() => {
    if (freeTextContent !== entry.free_text_content) {
      dispatch(amendEntryThunk({cid: entry.cid, planData: {free_text_content: freeTextContent}}));
    } // eslint-disable-next-line
  }), []);

  const handleHoldClick = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        if (!entry.hold_data) {
          dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.hold, null, windowEnum.holdMenu));
        } else {
          dispatch(updateEntry({cid: entry.cid, data: {aclRouteDisplay: !entry.aclRouteDisplay ? 'hold_data' : null}}));
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
            aclRouteDisplay: !(entry.aclRouteDisplay === 'remarks') ? 'remarks' : null,
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
        if (now - (entry.pending_removal ?? now) > REMOVAL_TIMEOUT) {
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
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.hdg, null, windowEnum.headingMenu));
        break;
      case 1:
        if (entry.scratch_hdg && (displayScratchHdg || entry.hdg === null)) {
          let promotedHdg = 'LRH'.includes(entry.scratch_hdg.slice(-1)) ? entry.scratch_hdg : `H${entry.scratch_hdg}`;
          dispatch(amendEntryThunk({cid: entry.cid, planData: {hdg: promotedHdg, scratch_hdg: null}}));
        }
        break;
      case 2:
        dispatch(amendEntryThunk({
          cid: entry.cid,
          planData: {[(displayScratchHdg || !entry.hdg) && entry.scratch_hdg ? 'scratch_hdg' : 'hdg']: null}
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
        dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.spd, null, windowEnum.speedMenu));
        break;
      case 1:
        if (entry.scratch_spd && (displayScratchSpd || entry.spd === null)) {
          let promotedSpd = entry.scratch_spd.slice(0, 1) === 'M' ? entry.scratch_spd : `S${entry.scratch_spd}`;
          dispatch(amendEntryThunk({cid: entry.cid, planData: {spd: promotedSpd, scratch_spd: null}}));
        }
        break;
      case 2:
        dispatch(amendEntryThunk({
          cid: entry.cid,
          planData: {[(displayScratchSpd || !entry.spd) && entry.scratch_spd ? 'scratch_spd' : 'spd']: null}
        }));
        break;
      default:
        break;
    }
  };

  const isSelected = (cid: string, field: aclRowFieldEnum): boolean => {
    return asel?.window === windowEnum.acl && asel?.cid === cid && asel?.field === field;
  };

  return (<div className={`body-row-container ${index%3 === 2 ? 'row-sep-border' : ''}`}
               key={`acl-row-container-${entry.cid}`}
               onContextMenu={(event) => event.preventDefault()}>
    <div
      className={`body-row ${(now - (entry.pending_removal ?? now) > REMOVAL_TIMEOUT) ? 'pending-removal' : ''}`}>
      <EdstTooltip title={Tooltips.aclNAndVciBtn}>
        <div className={`body-col body-col-1 radio`}
             onMouseDown={updateVci}>
          {entry.vciStatus === -1 && 'N'}{entry.vciStatus === 1 && <img src={VCI} alt="wifi-symbol"/>}
        </div>
      </EdstTooltip>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1"/>
      <div className={`inner-row ${entry.aclHighlighted ? 'highlighted' : ''}`}
           ref={ref}
           style={{minWidth: entry.showFreeText ? '1200px' : 0}}
      >
        <EdstTooltip title={Tooltips.aclFlightId} onMouseDown={handleFidClick}>
          <div className={`body-col fid hover ${isSelected(entry.cid, aclRowFieldEnum.fid) ? 'selected' : ''}`}>
            {entry.cid} {entry.callsign}
            <span className="voice-type">
              {entry.voiceType === 'r' ? '/R' : entry.voiceType === 't' ? '/T' : ''}
            </span>
          </div>
        </EdstTooltip>
        <div className="body-col pa"/>
        <div className={`body-col special ${!entry.spa ? 'special-hidden' : ''}`}>
          {entry.spa && SPA_INDICATOR}
        </div>
        <EdstTooltip title={Tooltips.aclHotbox}>
          <div className="body-col special hotbox"
               onContextMenu={event => event.preventDefault()}
               onMouseDown={handleHotboxMouseDown}
          >
            {freeTextContent && '*'}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclType}>
          <div className={`body-col type hover ${hidden.includes(aclRowFieldEnum.type) ? 'content hidden' : ''}
        ${isSelected(entry.cid, aclRowFieldEnum.type) ? 'selected' : ''}`}
               onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.type))}
          >
            {`${entry.type}/${entry.equipment}`}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclAlt}>
          <div className={`body-col alt`}>
            <div className={`${altMouseDown ? 'md' : ''} ${entry.interim ? 'interim' : ''}
          ${isSelected(entry.cid, aclRowFieldEnum.alt) ? 'selected' : ''}`}
                 onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.alt, null, windowEnum.altitudeMenu))}
            >
              {entry.altitude}{entry.interim && `T${entry.interim}`}
            </div>
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclCode}>
          <div
            className={`body-col code hover ${hidden.includes(aclRowFieldEnum.code) ? 'content hidden' : ''}
          ${isSelected(entry.cid, aclRowFieldEnum.code) ? 'selected' : ''}`}
            onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.code))}
          >
            {entry.beacon}
          </div>
        </EdstTooltip>
        <div className={`body-col hover special`}
             onMouseDown={() => setDisplayScratchHdg(!displayScratchHdg)}
          // @ts-ignore
             disabled={!(entry.hdg && entry.scratch_hdg)}>
          {entry.hdg && entry.scratch_hdg && '*'}
        </div>
        <EdstTooltip title={Tooltips.aclHdg}>
          <div className={`body-col hs spd hover ${hidden.includes(aclRowFieldEnum.hdg) ? 'content hidden' : ''}
              ${isSelected(entry.cid, aclRowFieldEnum.hdg) ? 'selected' : ''} ${(entry.scratch_hdg && (displayScratchHdg || entry.hdg === null)) ? 'yellow' : ''}`}
               onMouseDown={handleHeadingClick}
          >
            {(entry.scratch_hdg && (displayScratchHdg || entry.hdg === null)) ? entry.scratch_hdg : entry.hdg}
          </div>
        </EdstTooltip>
        <div className="body-col hs-slash">
          /
        </div>
        <EdstTooltip title={Tooltips.aclSpd}>
          <div className={`body-col hs spd hover ${hidden.includes(aclRowFieldEnum.spd) ? 'content hidden' : ''}
${isSelected(entry.cid, aclRowFieldEnum.spd) ? 'selected' : ''} ${(entry.scratch_spd && (displayScratchSpd || entry.spd === null)) ? 'yellow' : ''}`}
               onMouseDown={handleSpeedClick}
          >
            {(entry.scratch_spd && (displayScratchSpd || entry.spd === null)) ? entry.scratch_spd : entry.spd}
          </div>
        </EdstTooltip>
        <div className={`body-col hover special`}
             onMouseDown={() => setDisplayScratchSpd(!displayScratchSpd)}
          // @ts-ignore
             disabled={!(entry.spd && entry.scratch_spd)}>
          {entry.spd && entry.scratch_spd && '*'}
        </div>
        <div className={`body-col special`}
          // @ts-ignore
             disabled={true}/>
        <div className={`body-col special hold-col ${isSelected(entry.cid, aclRowFieldEnum.hold) ? 'selected' : ''}`}
             onMouseDown={handleHoldClick}
             onContextMenu={(event) => {
               event.preventDefault();
               if (entry?.hold_data) {
                 dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.route, null, windowEnum.cancelHoldMenu));
               }
             }}
          // @ts-ignore
             disabled={!anyHolding}
        >
          {entry.hold_data ? 'H' : ''}
        </div>
        <EdstTooltip title={Tooltips.aclRemarksBtn}>
          <div className={`body-col special ${!entry.remarksChecked ? 'remarks-unchecked' : ''}`}
            // @ts-ignore
               disabled={!(entry.flightplan.remarks?.length > 0)}
               onMouseDown={handleRemarksClick}
          >
            *
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclRoute}>
          <div className={`body-col route hover ${isSelected(entry.cid, aclRowFieldEnum.route) ? 'selected' : ''}`}
               onMouseDown={(event) => dispatch(aclAircraftSelect(event, entry.cid, aclRowFieldEnum.route, null, windowEnum.routeMenu))}
          >
            {entry.aclRouteDisplay === 'hold_data' && holdData &&
            `${holdData.hold_fix} ${holdData.hold_direction} ${holdData.turns} ${holdData.leg_length} EFC ${formatUtcMinutes(holdData.efc)}`}
            {entry.aclRouteDisplay === 'remarks' && <span>{entry.flightplan.remarks}</span>}
            {entry.aclRouteDisplay === 'raw_route' && <span>{entry.flightplan.route}</span>}
            {!entry.aclRouteDisplay && <span className="no-pad">
            <span
              className={`${aarAvail && !onAar ? 'amendment-1' : ''} ${isSelected(entry.cid, aclRowFieldEnum.route) ? 'selected' : ''}`}>
              {entry.dep}
            </span>
            ./.
              {entry.cleared_direct?.fix && route.startsWith(entry.cleared_direct?.fix) && entry.cleared_direct?.frd + '..'}
              {/*{entry.reference_fix ? computeFrd(entry.reference_fix) + '.' : ''}*/}
              {route}{!route.endsWith('.') && route.length > 0 && `.`}
              {pendingAar && !onAar &&
              <span className={`amendment-2 ${isSelected(entry.cid, aclRowFieldEnum.route) ? 'selected' : ''}`}>
              {`[${pendingAar}]`}
              </span>}
              {entry.dest}
          </span>}
          </div>
        </EdstTooltip>
      </div>
    </div>
    {entry.showFreeText && <div className="body-row">
      <div className={`body-col body-col-1 radio`}/>
      <div className="body-col body-col-1"/>
      <div className="body-col body-col-1"/>
      <div className="body-col body-col-1"/>
      <div className="body-col body-col-1"/>
      <div className={`inner-row-2 ${entry.aclHighlighted ? 'highlighted' : ''}`}
           style={{minWidth: Math.max(1200, ref?.current?.clientWidth ?? 0) + 'px'}}
      >
        <div className="free-text-row">
          <input
            onFocus={() => dispatch(setInputFocused(true))}
            onBlur={() => dispatch(setInputFocused(false))}
            value={freeTextContent}
            onChange={(event) => setFreeTextContent(event.target.value.toUpperCase())}/>
        </div>
      </div>
    </div>}
  </div>);
};
