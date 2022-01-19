import React, {useContext, useRef, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {computeFrd, formatUtcMinutes, REMOVAL_TIMEOUT} from "../../../lib";
import {AclContext, EdstContext} from "../../../contexts/contexts";
import VCI from '../../../css/images/VCI_v4.png';

const SPA_INDICATOR = '^';

export function AclRow(props) {
  const {
    aircraftSelect,
    updateEntry,
    amendEntry,
    deleteEntry,
    setInputFocused
  } = useContext(EdstContext);
  const {asel} = useContext(AclContext);
  const {entry, hidden, alt_mouse_down, bottom_border, any_holding} = props;
  const hold_data = entry.hold_data;
  const now = new Date().getTime();
  let route = entry._route;
  const dest = entry.dest;
  if (route.slice(-dest.length) === dest) {
    route = route.slice(0, -dest.length);
  }

  const [scratchpad, setScratchpad] = useState(entry?.scratchpad || '');
  const ref = useRef(null);

  const current_fix_names = entry._route_data.map(fix => fix.name);
  const aar_avail = (entry?.aar_list?.filter((aar) => aar.eligible && current_fix_names.includes(aar.tfix))?.length > 1 && !(entry?._aar_list?.filter((aar) => aar.on_eligible_aar) > 0));
  const on_aar = entry?._aar_list?.filter((aar) => aar.on_eligible_aar).length > 0;

  const checkAarReroutePending = () => {
    const current_fix_names = entry._route_data.map(fix => fix.name);
    const eligible_aar = entry?._aar_list?.filter((aar) => aar.eligible);
    if (eligible_aar?.length === 1) {
      const aar = eligible_aar[0];
      if (current_fix_names.includes(aar.tfix)) {
        return aar.aar_amendment_route_string;
      }
    }
    return null;
  }
  const pending_aar = checkAarReroutePending();

  const handleBoxMouseDown = (event, entry) => {
    event.preventDefault();
    if (event.button === 0) {
      amendEntry(entry.cid, {scratchpad: scratchpad});
      updateEntry(entry.cid, {free_text: !entry.free_text});
    }
    if (event.button === 1) {
      updateEntry(entry.cid, {spa: !(typeof (entry.spa) === 'number')});
    }
    if (event.button === 2) {
      updateEntry(entry.cid, {acl_highlighted: !entry.acl_highlighted});
    }
  }

  const handleHoldClick = (event) => {
    switch (event.button) {
      case 0:
        if (!entry?.hold_data) {
          aircraftSelect(event, 'acl', entry.cid, 'hold');
        } else {
          updateEntry(entry.cid, {show_hold_info: !entry.show_hold_info});
        }
        break;
      case 1:
        aircraftSelect(event, 'acl', entry.cid, 'hold');
        break;
      default:
        break;
    }
  }

  const handleFidClick = (event) => {
    const now = new Date().getTime();
    switch (event.button) {
      case 2:
        if (now - (entry.pending_removal || now) > REMOVAL_TIMEOUT) {
          deleteEntry('acl', entry.cid);
        }
        break;
      default:
        aircraftSelect(event, 'acl', entry.cid, 'fid');
        break;

    }
  }

  const isSelected = (cid, field) => {
    return asel?.cid === cid && asel?.field === field;
  }

  return (<div className={`body-row-container ${bottom_border ? 'row-sep-border' : ''}`}
               key={`acl-row-container-${entry.cid}`}
               onContextMenu={(event) => event.preventDefault()}>
    <div className={`body-row ${(now - (entry.pending_removal || now) > REMOVAL_TIMEOUT) ? 'pending-removal' : ''}`}>
      <div className={`body-col body-col-1 radio ${entry.acl_status === 1 ? 'green' : ''}`}
           onMouseDown={() => props.updateStatus(entry.cid)}>
        {entry.acl_status === -1 && 'N'}{entry.acl_status === 1 && <img src={VCI} alt="wifi-symbol"/>}
      </div>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1"/>
      <div className={`inner-row ${entry.acl_highlighted ? 'highlighted' : ''}`}
           ref={ref}
           style={{minWidth: entry.free_text ? '1200px' : 0}}
      >
        <div className={`body-col fid hover ${isSelected(entry.cid, 'fid') ? 'selected' : ''}`}
             onMouseDown={handleFidClick}
        >
          {entry.cid} {entry.callsign}
        </div>
        <div className="body-col pa"/>
        <div className={`body-col special ${!(typeof (entry.spa) === 'number') ? 'special-hidden' : ''}`}>
          {(typeof (entry.spa) === 'number') && SPA_INDICATOR}
        </div>
        <div className="body-col special rem"
             onContextMenu={event => event.preventDefault()}
             onMouseDown={(event) => handleBoxMouseDown(event, entry)}
        >
          {scratchpad && '*'}
        </div>
        <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${isSelected(entry.cid, 'type') ? 'selected' : ''}`}
             onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'type')}
        >
          {`${entry.type}/${entry.equipment}`}
        </div>
        <div className={`body-col alt`}>
          <div className={`${alt_mouse_down ? 'md' : ''} ${entry.interim ? 'interim' : ''}
          ${isSelected(entry.cid, 'alt') ? 'selected' : ''}`}
               onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'alt')}
          >
            {entry.altitude}{entry.interim && `T${entry.interim}`}
          </div>
        </div>
        <div
          className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''}
          ${isSelected(entry.cid, 'code') ? 'selected' : ''}`}
          onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'code')}
        >
          {entry.beacon}
        </div>
        <div className={`body-col hs hdg hover ${hidden.includes('hdg') ? 'content hidden' : ''}
              ${isSelected(entry.cid, 'hdg') ? 'selected' : ''} ${entry?.scratch_hdg?.scratchpad ? 'yellow' : ''}`}
             onMouseDown={(event) => {
               if (event.button === 0) {
                 aircraftSelect(event, 'acl', entry.cid, 'hdg');
               } else if (event.button === 2) {
                 updateEntry(entry.cid, {scratch_hdg: null});
               }
             }}
        >
          {entry?.scratch_hdg?.val}
        </div>
        <div className="body-col hs-slash">
          /
        </div>
        <div className={`body-col hs spd hover ${hidden.includes('spd') ? 'content hidden' : ''}
${isSelected(entry.cid, 'spd') ? 'selected' : ''} ${entry?.scratch_spd?.scratchpad ? 'yellow' : ''}`}
             onMouseDown={(event) => {
               if (event.button === 0) {
                 aircraftSelect(event, 'acl', entry.cid, 'spd');
               } else if (event.button === 2) {
                 updateEntry(entry.cid, {scratch_spd: null});
               }
             }}
        >
          {entry?.scratch_spd?.val}
        </div>
        <div className={`body-col special`} disabled={true}/>
        <div className={`body-col special hold-col ${isSelected(entry.cid, 'hold') ? 'selected' : ''}`}
             onMouseDown={handleHoldClick}
             onContextMenu={(event) => {
               event.preventDefault();
               if (entry?.hold_data) {
                 aircraftSelect(event, null, entry.cid, 'cancel-hold');
               }
             }}
             disabled={!any_holding}
        >
          {entry.hold_data ? 'H' : ''}
        </div>
        <div className={`body-col special`} disabled={true}>
        </div>
        <div className={`body-col route hover ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}
             onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'route')}
        >
          {entry.show_hold_info && hold_data &&
          `${hold_data.hold_fix} ${hold_data.hold_direction} ${hold_data.turns} ${hold_data.leg_length} EFC ${formatUtcMinutes(hold_data.efc)}`}
          {!entry.show_hold_info && <div>
            <span
              className={`${aar_avail && !on_aar ? 'amendment-1' : ''} ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>{entry.dep}</span>
            ./.{entry.reference_fix ? computeFrd(entry.reference_fix) + '..' : '.'}
            {route?.replace(/^\.*/, '')}
            {pending_aar && !on_aar &&
            <span className={`amendment-2 ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>
              {`[${pending_aar}]`}
              </span>}
            {route?.slice(-1) !== '.' && '..'}{entry.dest}
          </div>}
        </div>
      </div>
    </div>
    {entry.free_text && <div className="body-row">
      <div className={`body-col body-col-1 radio`}/>
      <div className="body-col body-col-1"/>
      <div className="body-col body-col-1"/>
      <div className="body-col body-col-1"/>
      <div className="body-col body-col-1"/>
      <div className={`inner-row-2 ${entry.acl_highlighted ? 'highlighted' : ''}`}
           style={{minWidth: Math.max(1200, ref.current?.clientWidth) + 'px'}}
      >
        <div className="free-text-row">
          <input
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            value={scratchpad}
            onChange={(event) => setScratchpad(event.target.value.toUpperCase())}/>
        </div>
      </div>
    </div>}
  </div>);
}
