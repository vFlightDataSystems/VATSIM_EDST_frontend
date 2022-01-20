import {useContext, useRef, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';
import {REMOVAL_TIMEOUT} from "../../../lib";
import {DepContext, EdstContext} from "../../../contexts/contexts";

const SPA_INDICATOR = '^';
const COMPLETED_SYMBOL = '✓';

export function DepRow(props) {
  const {
    aircraftSelect,
    updateEntry,
    amendEntry,
    deleteEntry,
    setInputFocused
  } = useContext(EdstContext);
  const {asel} = useContext(DepContext);
  const {entry, hidden, bottom_border} = props;
  const now = new Date().getTime();
  let route = entry.route;
  const dest = entry.dest;
  if (route.slice(-dest.length) === dest) {
    route = route.slice(0, -dest.length);
  }

  const [scratchpad, setScratchpad] = useState(entry?.scratchpad ?? '');
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
      updateEntry(entry.cid, {dep_highlighted: !entry.dep_highlighted});
    }
  }

  const handleFidClick = (event) => {
    const now = new Date().getTime();
    switch (event.button) {
      case 2:
        if (now - (entry.pending_removal ?? now) > REMOVAL_TIMEOUT) {
          deleteEntry('dep', entry.cid);
        }
        break;
      default:
        aircraftSelect(event, 'dep', entry.cid, 'fid');
        break;

    }
  }

  const isSelected = (cid, field) => {
    return asel?.cid === cid && asel?.field === field;
  }

  return (<div className={`body-row-container ${bottom_border ? 'row-sep-border' : ''}`}
               key={`dep-row-container-${entry.cid}`}
               onContextMenu={(event) => event.preventDefault()}>
    <div className={`body-row ${(now - (entry.pending_removal ?? now) > REMOVAL_TIMEOUT) ? 'pending-removal' : ''}`}>
      <div className={`body-col body-col-1 radio dep-radio ${entry.dep_status === 1 ? 'checkmark' : ''}`}
           onMouseDown={() => props.updateStatus(entry.cid)}
      >
        {entry.dep_status === -1 && 'N'}{entry.dep_status === 1 && COMPLETED_SYMBOL}
      </div>
      <div className="body-col body-col-2">
        0000
      </div>
      <div className={`inner-row ${entry.dep_highlighted ? 'highlighted' : ''}`}
           ref={ref}
           style={{minWidth: entry.free_text ? '1200px' : 0}}
      >
        <div className={`body-col fid dep-fid hover ${isSelected(entry.cid, 'fid') ? 'selected' : ''}`}
             onMouseDown={handleFidClick}
             onContextMenu={(event) => event.preventDefault()}
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
             onMouseDown={(event) => aircraftSelect(event, 'dep', entry.cid, 'type')}
        >
          {`${entry.type}/${entry.equipment}`}
        </div>
        <div className={`body-col alt`}>
          <div className={`${isSelected(entry.cid, 'alt') ? 'selected' : ''}`}
               onMouseDown={(event) => aircraftSelect(event, 'dep', entry.cid, 'alt')}
          >
            {entry.altitude}
          </div>
        </div>
        <div
          className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''} 
          ${isSelected(entry.cid, 'code') ? 'selected' : ''}`}
          onMouseDown={(event) => aircraftSelect(event, 'dep', entry.cid, 'code')}
        >
          {entry.beacon}
        </div>
        <div className={`body-col route hover ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}
             onMouseDown={(event) => aircraftSelect(event, 'dep', entry.cid, 'route')}
        >
          <span>
              <span
                className={`${aar_avail && !on_aar ? 'amendment-1' : ''} ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>{entry.dep}</span>{route}
            {pending_aar && !on_aar &&
            <span className={`amendment-2 ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>
              {`[${pending_aar}]`}
              </span>}
            {route?.slice(-1) !== '.' && '..'}{entry.dest}
          </span>
        </div>
      </div>
    </div>
    {entry.free_text && <div className="body-row">
      <div className={`body-col body-col-1 radio`}/>
      <div className="body-col body-col-2"/>
      <div className={`inner-row-2 ${entry.dep_highlighted ? 'highlighted' : ''}`}
           style={{minWidth: Math.max(1200, ref.current?.clientWidth) + 'px'}}
      >
        <div className="free-text-row dep-free-text-row">
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