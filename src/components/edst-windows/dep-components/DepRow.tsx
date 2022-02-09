import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';
import {REMOVAL_TIMEOUT} from "../../../lib";
import {DepContext, EdstContext} from "../../../contexts/contexts";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {EdstEntryType} from "../../../types";

const SPA_INDICATOR = '^';
const COMPLETED_SYMBOL = '✓';

interface DepRowProps {
  entry: EdstEntryType;
  hidden: string[];
  index: number;
  updateStatus: Function;
}

export const DepRow: React.FC<DepRowProps> = ({entry, hidden, index, updateStatus}) => {
  const {
    aircraftSelect,
    updateEntry,
    amendEntry,
    deleteEntry,
    setInputFocused
  } = useContext(EdstContext);
  const {asel} = useContext(DepContext);
  const now = new Date().getTime();
  let route = entry.route;
  const dest = entry.dest;
  if (route.slice(-dest.length) === dest) {
    route = route.slice(0, -dest.length);
  }

  const [freeTextContent, setFreeTextContent] = useState(entry.free_text_content ?? '');
  const ref = useRef<HTMLDivElement | null>(null);

  const current_fix_names = entry.route_data.map(fix => fix.name);
  const aar_avail = (entry.aar_list?.filter((aar) => aar.eligible && current_fix_names.includes(aar.tfix))
    && !(entry?._aar_list?.filter((aar) => aar.on_eligibleAar)));
  const on_aar = !!entry._aar_list?.filter((aar) => aar.on_eligibleAar);

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
  }
  const pendingAar = checkAarReroutePending();

  const handleHotboxMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    if (event.button === 0) {
      amendEntry(entry.cid, {free_text_content: freeTextContent});
      updateEntry(entry.cid, {showFreeText: !entry.showFreeText});
    }
    if (event.button === 1) {
      updateEntry(entry.cid, {spa: !(typeof (entry.spa) === 'number'), free_text_content: freeTextContent});
    }
    if (event.button === 2) {
      updateEntry(entry.cid, {depHighlighted: !entry.depHighlighted});
    }
  }

  useEffect(() => (() => amendEntry(entry.cid, {free_text_content: freeTextContent})));

  const handleFidClick = (event: React.MouseEvent) => {
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

  const isSelected = (cid: string, field: string) => {
    return asel?.cid === cid && asel?.field === field;
  }

  return (<div className={`body-row-container ${index % 3 === 2 ? 'row-sep-border' : ''}`}
               key={`dep-row-container-${entry.cid}`}
               onContextMenu={(event) => event.preventDefault()}>
    <div className={`body-row ${(now - (entry.pending_removal ?? now) > REMOVAL_TIMEOUT) ? 'pending-removal' : ''}`}>
      <EdstTooltip title={Tooltips.depCheckmarkNBtn}>
        <div className={`body-col body-col-1 radio dep-radio ${entry.depStatus === 1 ? 'checkmark' : ''}`}
             onMouseDown={() => updateStatus(entry.cid)}
        >
          {entry.depStatus === -1 && 'N'}{entry.depStatus === 1 && COMPLETED_SYMBOL}
        </div>
      </EdstTooltip>
      <div className="body-col body-col-2">
        0000
      </div>
      <div className={`inner-row ${entry.depHighlighted ? 'highlighted' : ''}`}
           ref={ref}
           style={{minWidth: entry.showFreeText ? '1200px' : 0}}
      >
        <EdstTooltip title={Tooltips.depFlightId}>
          <div className={`body-col fid dep-fid hover ${isSelected(entry.cid, 'fid') ? 'selected' : ''}`}
               onMouseDown={handleFidClick}
               onContextMenu={(event) => event.preventDefault()}
          >
            {entry.cid} {entry.callsign}{entry.voice_type === 'r' ? '/R' : entry.voice_type === 't' ? '/T' : ''}
          </div>
        </EdstTooltip>
        <div className="body-col pa"/>
        <div className={`body-col special ${!(typeof (entry.spa) === 'number') ? 'special-hidden' : ''}`}>
          {(typeof (entry.spa) === 'number') && SPA_INDICATOR}
        </div>
        <EdstTooltip title={Tooltips.depHotbox}>
          <div className="body-col special hotbox"
               onContextMenu={event => event.preventDefault()}
               onMouseDown={handleHotboxMouseDown}
          >
            {freeTextContent && '*'}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.depType}>
          <div className={`body-col type hover ${hidden.includes('type') ? 'content hidden' : ''}
        ${isSelected(entry.cid, 'type') ? 'selected' : ''}`}
               onMouseDown={(event) => aircraftSelect(event, 'dep', entry.cid, 'type')}
          >
            {`${entry.type}/${entry.equipment}`}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.depAlt}>
          <div className={`body-col alt`}>
            <div className={`${isSelected(entry.cid, 'alt') ? 'selected' : ''}`}
                 onMouseDown={(event) => aircraftSelect(event, 'dep', entry.cid, 'alt')}
            >
              {entry.altitude}
            </div>
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.depCode}>
          <div className={`body-col code hover ${hidden.includes('code') ? 'content hidden' : ''} 
          ${isSelected(entry.cid, 'code') ? 'selected' : ''}`}
               onMouseDown={(event) => aircraftSelect(event, 'dep', entry.cid, 'code')}
          >
            {entry.beacon}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.depRoute}>
          <div className={`body-col route hover ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}
               onMouseDown={(event) => aircraftSelect(event, 'dep', entry.cid, 'route')}
          >
          <span>
              <span
                className={`${aar_avail && !on_aar ? 'amendment-1' : ''} ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>
                {entry.dep}
              </span>
            {route}
            {pendingAar && !on_aar &&
            <span className={`amendment-2 ${isSelected(entry.cid, 'route') ? 'selected' : ''}`}>
              {`[${pendingAar}]`}
              </span>}
            {route?.slice(-1) !== '.' && '..'}{entry.dest}
          </span>
          </div>
        </EdstTooltip>
      </div>
    </div>
    {entry.showFreeText && <div className="body-row">
      <div className={`body-col body-col-1 radio`}/>
      <div className="body-col body-col-2"/>
      <div className={`inner-row-2 ${entry.depHighlighted ? 'highlighted' : ''}`}
           style={{minWidth: Math.max(1200, ref?.current?.clientWidth ?? 0) + 'px'}}
      >
        <div className="free-text-row dep-free-text-row">
          <input
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            value={freeTextContent}
            onChange={(event) => setFreeTextContent(event.target.value.toUpperCase())}/>
        </div>
      </div>
    </div>}
  </div>);
}