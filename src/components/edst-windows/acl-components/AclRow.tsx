import React, {MouseEventHandler, useContext, useRef, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {formatUtcMinutes, REMOVAL_TIMEOUT} from "../../../lib";
import {AclContext, EdstContext} from "../../../contexts/contexts";
import VCI from '../../../css/images/VCI_v4.png';
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {EdstEntryType} from "../../../types";
import _ from "lodash";
import {useAppSelector} from "../../../redux/hooks";

const SPA_INDICATOR = '^';

interface AclRowProps {
  key: string;
  entry: EdstEntryType;
  index: number;
  any_holding: boolean;
  hidden: string[];
  alt_mouse_down: boolean;
  updateVci: (cid: string) => void;
}

export const AclRow: React.FC<AclRowProps> = (
  {
    entry,
    hidden,
    alt_mouse_down,
    index,
    any_holding,
    ...props
  }) => {
  const {
    aircraftSelect,
    updateEntry,
    amendEntry,
    deleteEntry,
    setInputFocused
  } = useContext(EdstContext);
  const {asel} = useContext(AclContext);
  const manual_posting = useAppSelector((state) => state.acl.manual_posting);

  const hold_data = entry.hold_data;
  const now = new Date().getTime();
  let route = entry._route?.replace(/^\.+/, '') ?? entry.route;
  const dest = entry.dest;
  if (route.slice(-dest.length) === dest) {
    route = route.slice(0, -dest.length);
  }

  const [display_scratch_hdg, setDisplayScratchHdg] = useState(false);
  const [display_scratch_spd, setDisplayScratchSpd] = useState(false);
  const [scratchpad, setScratchpad] = useState(entry.free_text_content ?? '');
  const ref = useRef<HTMLDivElement | null>(null);

  const current_fix_names = (entry._route_data ?? entry.route_data).map(fix => fix.name);
  const aar_avail = (entry.aar_list?.filter((aar) => aar.eligible && current_fix_names.includes(aar.tfix)) && !(entry._aar_list?.filter((aar) => aar.on_eligible_aar)));
  const on_aar = !!entry._aar_list?.filter((aar) => aar.on_eligible_aar);

  const checkAarReroutePending = () => {
    const current_fix_names = (entry._route_data ?? entry.route_data).map(fix => fix.name);
    const eligible_aar = entry?._aar_list?.filter((aar) => aar.eligible);
    if (eligible_aar?.length === 1) {
      const aar = eligible_aar[0];
      if (current_fix_names.includes(aar.tfix)) {
        return aar.aar_amendment_route_string;
      }
    }
    return null;
  };
  const pending_aar = checkAarReroutePending();

  const handleHotboxMouseDown = (event: React.MouseEvent, entry: EdstEntryType) => {
    event.preventDefault();
    if (event.button === 0) {
      amendEntry(entry.cid, {scratchpad: scratchpad});
      updateEntry(entry.cid, {free_text: !entry.free_text});
    }
    if (event.button === 1) {
      updateEntry(entry.cid, {spa: !_.isNumber(entry.spa)});
    }
    if (event.button === 2) {
      updateEntry(entry.cid, {acl_highlighted: !entry.acl_highlighted});
    }
  };

  const handleHoldClick = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        if (!entry.hold_data) {
          aircraftSelect(event, 'acl', entry.cid, 'hold');
        } else {
          updateEntry(entry.cid, {acl_route_display: !entry.acl_route_display ? 'hold_data' : null});
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
    if (entry.acl_status === -1 && !manual_posting) {
      updateEntry(entry.cid, {acl_status: 0});
    }
    switch (event.button) {
      case 0:
        updateEntry(entry.cid, {
          acl_route_display: !(entry.acl_route_display === 'remarks') ? 'remarks' : null,
          remarks_checked: true
        });
        break;
      case 2:
        updateEntry(entry.cid, {acl_route_display: !(entry.acl_route_display === 'raw_route') ? 'raw_route' : null});
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
        }
        else if (event.detail === 2) {
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
        if (entry.scratch_hdg && (display_scratch_hdg || entry.hdg === null)) {
          let promoted_hdg = 'LRH'.includes(entry.scratch_hdg.slice(-1)) ? entry.scratch_hdg : `H${entry.scratch_hdg}`;
          amendEntry(entry.cid, {hdg: promoted_hdg, scratch_hdg: null});
        }
        break;
      case 2:
        amendEntry(entry.cid, {[(display_scratch_hdg || !entry.hdg) && entry.scratch_hdg ? 'scratch_hdg' : 'hdg']: null});
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
        if (entry.scratch_spd && (display_scratch_spd || entry.spd === null)) {
          let promoted_spd = entry.scratch_spd.slice(0, 1) === 'M' ? entry.scratch_spd : `S${entry.scratch_spd}`;
          amendEntry(entry.cid, {spd: promoted_spd, scratch_spd: null});
        }
        break;
      case 2:
        amendEntry(entry.cid, {[(display_scratch_spd || !entry.spd) && entry.scratch_spd ? 'scratch_spd' : 'spd']: null});
        break;
      default:
        break;
    }
  };

  const isSelected = (cid: string, field: string): boolean => {
    return asel?.cid === cid && asel?.field === field;
  };

  return (<div className={`body-row-container ${index % 3 === 2 ? 'row-sep-border' : ''}`}
               key={`acl-row-container-${entry.cid}`}
               onContextMenu={(event) => event.preventDefault()}>
    <div
      className={`body-row ${(now - (entry.pending_removal ?? now) > REMOVAL_TIMEOUT) ? 'pending-removal' : ''}`}>
      <EdstTooltip title={Tooltips.acl_N_and_VCI_button}>
        <div className={`body-col body-col-1 radio`}
             onMouseDown={() => props.updateVci(entry.cid)}>
          {entry.acl_status === -1 && 'N'}{entry.acl_status === 1 && <img src={VCI} alt="wifi-symbol"/>}
        </div>
      </EdstTooltip>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1 border"/>
      <div className="body-col body-col-1"/>
      <div className={`inner-row ${entry.acl_highlighted ? 'highlighted' : ''}`}
           ref={ref}
           style={{minWidth: entry.free_text ? '1200px' : 0}}
      >
        <EdstTooltip title={Tooltips.acl_flight_id} onMouseDown={handleFidClick}>
          <div className={`body-col fid hover ${isSelected(entry.cid, 'fid') ? 'selected' : ''}`}>
            {entry.cid} {entry.callsign}
            <span className="voice-type">
              {entry.voice_type === 'r' ? '/R' : entry.voice_type === 't' ? '/T' : ''}
            </span>
          </div>
        </EdstTooltip>
        <div className="body-col pa"/>
        <div className={`body-col special ${!(typeof (entry.spa) === 'number') ? 'special-hidden' : ''}`}>
          {(typeof (entry.spa) === 'number') && SPA_INDICATOR}
        </div>
        <EdstTooltip title={Tooltips.acl_hotbox}>
          <div className="body-col special hotbox"
               onContextMenu={event => event.preventDefault()}
               onMouseDown={(event) => handleHotboxMouseDown(event, entry)}
          >
            {scratchpad && '*'}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.acl_type}>
          <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${isSelected(entry.cid, 'type') ? 'selected' : ''}`}
               onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'type')}
          >
            {`${entry.type}/${entry.equipment}`}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.acl_alt}>
          <div className={`body-col alt`}>
            <div className={`${alt_mouse_down ? 'md' : ''} ${entry.interim ? 'interim' : ''}
          ${isSelected(entry.cid, 'alt') ? 'selected' : ''}`}
                 onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'alt')}
            >
              {entry.altitude}{entry.interim && `T${entry.interim}`}
            </div>
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.acl_code}>
          <div
            className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''}
          ${isSelected(entry.cid, 'code') ? 'selected' : ''}`}
            onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'code')}
          >
            {entry.beacon}
          </div>
        </EdstTooltip>
        <div className={`body-col hover special`}
             onMouseDown={() => setDisplayScratchHdg(!display_scratch_hdg)}
          // @ts-ignore
             disabled={!(entry.hdg && entry.scratch_hdg)}>
          {entry.hdg && entry.scratch_hdg && '*'}
        </div>
        <EdstTooltip title={Tooltips.acl_hdg}>
          <div className={`body-col hs spd hover ${hidden.includes('hdg') ? 'content hidden' : ''}
              ${isSelected(entry.cid, 'hdg') ? 'selected' : ''} ${(entry.scratch_hdg && (display_scratch_hdg || entry.hdg === null)) ? 'yellow' : ''}`}
               onMouseDown={handleHeadingClick}
          >
            {(entry.scratch_hdg && (display_scratch_hdg || entry.hdg === null)) ? entry.scratch_hdg : entry.hdg}
          </div>
        </EdstTooltip>
        <div className="body-col hs-slash">
          /
        </div>
        <EdstTooltip title={Tooltips.acl_spd}>
          <div className={`body-col hs spd hover ${hidden.includes('spd') ? 'content hidden' : ''}
${isSelected(entry.cid, 'spd') ? 'selected' : ''} ${(entry.scratch_spd && (display_scratch_spd || entry.spd === null)) ? 'yellow' : ''}`}
               onMouseDown={handleSpeedClick}
          >
            {(entry.scratch_spd && (display_scratch_spd || entry.spd === null)) ? entry.scratch_spd : entry.spd}
          </div>
        </EdstTooltip>
        <div className={`body-col hover special`}
             onMouseDown={() => setDisplayScratchSpd(!display_scratch_spd)}
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
             disabled={!any_holding}
        >
          {entry.hold_data ? 'H' : ''}
        </div>
        <EdstTooltip title={Tooltips.acl_remark_btn}>
          <div className={`body-col special ${!entry.remarks_checked ? 'remarks-unchecked' : ''}`}
            // @ts-ignore
               disabled={!(entry.flightplan.remarks?.length > 0)}
               onMouseDown={handleRemarksClick}
          >
            *
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.acl_route}>
          <div className={`body-col route hover ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}
               onMouseDown={(event) => aircraftSelect(event, 'acl', entry.cid, 'route')}
          >
            {entry.acl_route_display === 'hold_data' && hold_data &&
            `${hold_data.hold_fix} ${hold_data.hold_direction} ${hold_data.turns} ${hold_data.leg_length} EFC ${formatUtcMinutes(hold_data.efc)}`}
            {entry.acl_route_display === 'remarks' && <span>{entry.flightplan.remarks}</span>}
            {entry.acl_route_display === 'raw_route' && <span>{entry.flightplan.route}</span>}
            {!entry.acl_route_display && <span className="no-pad">
            <span
              className={`${aar_avail && !on_aar ? 'amendment-1' : ''} ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>
              {entry.dep}
            </span>
            ./.
              {entry.cleared_direct?.fix && route.startsWith(entry.cleared_direct?.fix) && entry.cleared_direct?.frd + '..'}
              {/*{entry.reference_fix ? computeFrd(entry.reference_fix) + '.' : ''}*/}
              {route}{!route.endsWith('.') && route.length > 0 && `.`}
              {pending_aar && !on_aar &&
              <span className={`amendment-2 ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>
              {`[${pending_aar}]`}
              </span>}
              {entry.dest}
          </span>}
          </div>
        </EdstTooltip>
      </div>
    </div>
    {entry.free_text && <div className="body-row">
      <div className={`body-col body-col-1 radio`}/>
      <div className="body-col body-col-1"/>
      <div className="body-col body-col-1"/>
      <div className="body-col body-col-1"/>
      <div className="body-col body-col-1"/>
      <div className={`inner-row-2 ${entry.acl_highlighted ? 'highlighted' : ''}`}
           style={{minWidth: Math.max(1200, ref?.current?.clientWidth ?? 0) + 'px'}}
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
};
