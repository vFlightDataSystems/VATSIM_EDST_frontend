import React, {MouseEventHandler, useContext, useEffect, useRef, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {formatUtcMinutes, REMOVAL_TIMEOUT} from "../../../lib";
import {AclContext, EdstContext} from "../../../contexts/contexts";
import VCI from '../../../css/images/VCI_v4.png';
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {EdstEntryType} from "../../../types";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {updateEntry} from "../../../redux/reducers/entriesReducer";
import {toggleAclSpa} from "../../../redux/reducers/aclReducer";

const SPA_INDICATOR = '^';

interface AclRowProps {
  key: string;
  entry: EdstEntryType;
  index: number;
  anyHolding: boolean;
  hidden: string[];
  altMouseDown: boolean;
}

export const AclRow: React.FC<AclRowProps> = (
  {
    entry,
    hidden,
    altMouseDown,
    index,
    anyHolding
  }) => {
  const {
    aircraftSelect,
    amendEntry,
    deleteEntry,
    setInputFocused
  } = useContext(EdstContext);
  const {asel} = useContext(AclContext);
  const dispatch = useAppDispatch();
  const manualPosting = useAppSelector((state) => state.acl.manualPosting);
  const spaList = useAppSelector(state => state.acl.spaList);
  // if (entry.aar_list === undefined) {
  //   dispatch(fetchAarData(entry.cid));
  // }

  const holdData = entry.hold_data;
  const now = new Date().getTime();
  let route = entry._route?.replace(/^\.+/, '') ?? entry.route;
  const dest = entry.dest;
  if (route.slice(-dest.length) === dest) {
    route = route.slice(0, -dest.length);
  }

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
      amendEntry(entry.cid, {free_text_content: freeTextContent});
    }
    if (event.button === 1) {
      dispatch(toggleAclSpa(entry.cid));
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
      amendEntry(entry.cid, {free_text_content: freeTextContent});
    } // eslint-disable-next-line
  }), []);

  const handleHoldClick = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        if (!entry.hold_data) {
          aircraftSelect(event, 'acl', entry.cid, 'hold');
        } else {
          dispatch(updateEntry({cid: entry.cid, data: {aclRouteDisplay: !entry.aclRouteDisplay ? 'hold_data' : null}}));
        }
        break;
      case 1:
        aircraftSelect(event, 'acl', entry.cid, 'hold');
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
        dispatch(updateEntry({cid: entry.cid, data: {
          vciStatus: entry.vciStatus < 0 ? 0 : entry.vciStatus,
          aclRouteDisplay: !(entry.aclRouteDisplay === 'remarks') ? 'remarks' : null,
          remarks_checked: true
        }}));
        break;
      case 2:
        dispatch(updateEntry({cid: entry.cid, data: {aclRouteDisplay: !(entry.aclRouteDisplay === 'raw_route') ? 'raw_route' : null}}));
        break;
      default:
        break;
    }
  };

  const handleFidClick: MouseEventHandler = (event: React.MouseEvent & Event) => {
    const now = new Date().getTime();
    switch (event.button) {
      case 2:
        if (now - (entry.pending_removal ?? now) > REMOVAL_TIMEOUT) {
          deleteEntry('acl', entry.cid);
        }
        break;
      default:
        if (event.detail === 1) {
          aircraftSelect(event, 'acl', entry.cid, 'fid');
        } else if (event.detail === 2) {
          aircraftSelect(event, 'acl', entry.cid, 'fid-2');
        }
        break;

    }
  };

  const handleHeadingClick: MouseEventHandler = (event: React.MouseEvent & Event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        aircraftSelect(event, 'acl', entry.cid, 'hdg');
        break;
      case 1:
        if (entry.scratch_hdg && (displayScratchHdg || entry.hdg === null)) {
          let promotedHdg = 'LRH'.includes(entry.scratch_hdg.slice(-1)) ? entry.scratch_hdg : `H${entry.scratch_hdg}`;
          amendEntry(entry.cid, {hdg: promotedHdg, scratch_hdg: null});
        }
        break;
      case 2:
        amendEntry(entry.cid, {[(displayScratchHdg || !entry.hdg) && entry.scratch_hdg ? 'scratch_hdg' : 'hdg']: null});
        break;
      default:
        break;
    }
  };

  const handleSpeedClick: MouseEventHandler = (event: React.MouseEvent & Event) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        aircraftSelect(event, 'acl', entry.cid, 'spd');
        break;
      case 1:
        if (entry.scratch_spd && (displayScratchSpd || entry.spd === null)) {
          let promotedSpd = entry.scratch_spd.slice(0, 1) === 'M' ? entry.scratch_spd : `S${entry.scratch_spd}`;
          amendEntry(entry.cid, {spd: promotedSpd, scratch_spd: null});
        }
        break;
      case 2:
        amendEntry(entry.cid, {[(displayScratchSpd || !entry.spd) && entry.scratch_spd ? 'scratch_spd' : 'spd']: null});
        break;
      default:
        break;
    }
  };

  const isSelected = (cid: string, field: string): boolean => {
    return asel?.cid === cid && asel?.field === field;
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
          <div className={`body-col fid hover ${isSelected(entry.cid, 'fid') ? 'selected' : ''}`}>
            {entry.cid} {entry.callsign}
            <span className="voice-type">
              {entry.voice_type === 'r' ? '/R' : entry.voice_type === 't' ? '/T' : ''}
            </span>
          </div>
        </EdstTooltip>
        <div className="body-col pa"/>
        <div className={`body-col special ${!spaList.includes(entry.cid) ? 'special-hidden' : ''}`}>
          {spaList.includes(entry.cid) && SPA_INDICATOR}
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
          <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${isSelected(entry.cid, 'type') ? 'selected' : ''}`}
               onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'type')}
          >
            {`${entry.type}/${entry.equipment}`}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclAlt}>
          <div className={`body-col alt`}>
            <div className={`${altMouseDown ? 'md' : ''} ${entry.interim ? 'interim' : ''}
          ${isSelected(entry.cid, 'alt') ? 'selected' : ''}`}
                 onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'alt')}
            >
              {entry.altitude}{entry.interim && `T${entry.interim}`}
            </div>
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclCode}>
          <div
            className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''}
          ${isSelected(entry.cid, 'code') ? 'selected' : ''}`}
            onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'code')}
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
          <div className={`body-col hs spd hover ${hidden.includes('hdg') ? 'content hidden' : ''}
              ${isSelected(entry.cid, 'hdg') ? 'selected' : ''} ${(entry.scratch_hdg && (displayScratchHdg || entry.hdg === null)) ? 'yellow' : ''}`}
               onMouseDown={handleHeadingClick}
          >
            {(entry.scratch_hdg && (displayScratchHdg || entry.hdg === null)) ? entry.scratch_hdg : entry.hdg}
          </div>
        </EdstTooltip>
        <div className="body-col hs-slash">
          /
        </div>
        <EdstTooltip title={Tooltips.aclSpd}>
          <div className={`body-col hs spd hover ${hidden.includes('spd') ? 'content hidden' : ''}
${isSelected(entry.cid, 'spd') ? 'selected' : ''} ${(entry.scratch_spd && (displayScratchSpd || entry.spd === null)) ? 'yellow' : ''}`}
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
        <div className={`body-col special hold-col ${isSelected(entry.cid, 'hold') ? 'selected' : ''}`}
             onMouseDown={handleHoldClick}
             onContextMenu={(event) => {
               event.preventDefault();
               if (entry?.hold_data) {
                 aircraftSelect(event, null, entry.cid, 'cancel-hold');
               }
             }}
          // @ts-ignore
             disabled={!anyHolding}
        >
          {entry.hold_data ? 'H' : ''}
        </div>
        <EdstTooltip title={Tooltips.aclRemarksBtn}>
          <div className={`body-col special ${!entry.remarks_checked ? 'remarks-unchecked' : ''}`}
            // @ts-ignore
               disabled={!(entry.flightplan.remarks?.length > 0)}
               onMouseDown={handleRemarksClick}
          >
            *
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclRoute}>
          <div className={`body-col route hover ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}
               onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'route')}
          >
            {entry.aclRouteDisplay === 'hold_data' && holdData &&
            `${holdData.hold_fix} ${holdData.hold_direction} ${holdData.turns} ${holdData.leg_length} EFC ${formatUtcMinutes(holdData.efc)}`}
            {entry.aclRouteDisplay === 'remarks' && <span>{entry.flightplan.remarks}</span>}
            {entry.aclRouteDisplay === 'raw_route' && <span>{entry.flightplan.route}</span>}
            {!entry.aclRouteDisplay && <span className="no-pad">
            <span
              className={`${aarAvail && !onAar ? 'amendment-1' : ''} ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>
              {entry.dep}
            </span>
            ./.
              {entry.cleared_direct?.fix && route.startsWith(entry.cleared_direct?.fix) && entry.cleared_direct?.frd + '..'}
              {/*{entry.reference_fix ? computeFrd(entry.reference_fix) + '.' : ''}*/}
              {route}{!route.endsWith('.') && route.length > 0 && `.`}
              {pendingAar && !onAar &&
              <span className={`amendment-2 ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>
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
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            value={freeTextContent}
            onChange={(event) => setFreeTextContent(event.target.value.toUpperCase())}/>
        </div>
      </div>
    </div>}
  </div>);
};
