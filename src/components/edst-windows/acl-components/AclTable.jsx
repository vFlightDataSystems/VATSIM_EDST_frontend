import {useContext, useEffect, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {AclRow} from "./AclRow";
import VCI from '../../../css/images/VCI_v4.png';
import {AclContext, EdstContext} from "../../../contexts/contexts";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";


export default function AclTable() {
  const [any_holding, setAnyHolding] = useState(false);
  const [any_assigned_heading, setAnyAssignedHeading] = useState(false);
  const [any_assigned_speed, setAnyAssignedSpeed] = useState(false);
  const [hidden, setHidden] = useState([]);
  const [alt_mouse_down, setAltMouseDown] = useState(false);
  const {
    edst_data,
    updateEntry,
  } = useContext(EdstContext);
  const {cid_list, sort_data, manual_posting} = useContext(AclContext);

  // check whether any aircraft in the list is holding
  const checkHolding = () => {
    for (let cid of cid_list) {
      if (edst_data[cid]?.hold_data) {
        setAnyHolding(true);
        return;
      }
    }
    setAnyHolding(false);
  }
  // check whether any aircraft in the list has an assigned heading or a speed
  // will display a * next to Hdg or Spd if the column is hidden, respectively
  const checkAssignedHdgSpd = () => {
    let any_hdg = false;
    let any_spd = false;
    for (let cid of cid_list) {
      if (edst_data[cid]?.scratch_hdg && !any_hdg) {
        any_hdg = true
      }
      if (edst_data[cid]?.scratch_spd && !any_spd) {
        any_spd = true
      }
      if (any_spd && any_hdg) break;
    }
    setAnyAssignedHeading(any_hdg);
    setAnyAssignedSpeed(any_spd);
  }

  useEffect(() => {
    checkHolding();
    checkAssignedHdgSpd();
  });

  const toggleHideColumn = (name) => {
    let hidden_copy = hidden.slice(0);
    const index = hidden_copy.indexOf(name);
    if (index > -1) {
      hidden_copy.splice(index, 1);
    } else {
      hidden_copy.push(name);
    }
    setHidden(hidden_copy);
  }

  const handleClickSlash = () => {
    let hidden_copy = hidden.slice(0);
    if (hidden_copy.includes('spd') && hidden_copy.includes('hdg')) {
      hidden_copy.splice(hidden_copy.indexOf('spd'), 1);
      hidden_copy.splice(hidden_copy.indexOf('hdg'), 1);
    } else {
      if (!hidden_copy.includes('hdg')) {
        hidden_copy.push('hdg');
      }
      if (!hidden_copy.includes('spd')) {
        hidden_copy.push('spd');
      }
    }
    setHidden(hidden_copy);
  }

  const updateVci = (cid) => {
    const entry = edst_data[cid];
    if (entry?.acl_status === -1 && manual_posting) {
      updateEntry(cid, {acl_status: 0});
    } else {
      if (entry?.acl_status < 1) {
        updateEntry(cid, {acl_status: 1});
      } else {
        updateEntry(cid, {acl_status: 0});
      }
    }
  }

  const sortFunc = (u, v) => {
    switch (sort_data.name) {
      case 'ACID':
        return u.callsign.localeCompare(v.callsign);
      case 'Destination':
        return u.dest.localeCompare(v.dest);
      case 'Origin':
        return u.dep.localeCompare(v.dep);
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  }

  const entry_list = Object.values(edst_data)?.filter(e => cid_list.has(e.cid));
  const spa_entry_list = Object.entries(entry_list.filter(e => (typeof (e.spa) === 'number'))?.sort((u, v) => u.spa - v.spa));

  return (<div className="acl-body no-select">
    <div className="body-row header" key="acl-table-header">
      <div className="body-col radio-header green">
        <img src={VCI} alt="wifi-symbol"/>
      </div>
      <div className="body-col body-col-1 red">
        R
      </div>
      <div className="body-col body-col-1 yellow">
        Y
      </div>
      <div className="body-col body-col-1 orange">
        A
      </div>
      <div className="body-col body-col-1"/>
      <div className="inner-row">
        <div className="body-col fid">
          Flight ID
        </div>
        <EdstTooltip className="body-col pa header" title={Tooltips.acl_header_pa} content="PA"/>
        <div className="body-col special special-hidden"/>
        <div className="body-col special special-hidden"/>
        <div className={`body-col type ${hidden.includes('type') ? 'hidden' : ''}`}>
          <div className="hover" onMouseDown={() => toggleHideColumn('type')}>
            T{!hidden.includes('type') && 'ype'}
          </div>
        </div>
        <div className="body-col alt header hover"
             onMouseDown={() => setAltMouseDown(true)}
             onMouseUp={() => setAltMouseDown(false)}
        >
          Alt.
        </div>
        <div className={`body-col code hover ${hidden.includes('code') ? 'hidden' : ''}`}
             onMouseDown={() => toggleHideColumn('code')}>
          C{!hidden.includes('code') && 'ode'}
        </div>
        <EdstTooltip title={Tooltips.acl_header_hdg}>
          <div className={`body-col hs hdg hover ${hidden.includes('hdg') ? 'hidden' : ''}`}
               onMouseDown={() => toggleHideColumn('hdg')}>
            {hidden.includes('hdg') && any_assigned_heading && '*'}H{!hidden.includes('hdg') && 'dg'}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.acl_header_slash}>
          <div className="body-col hs-slash hover" onMouseDown={handleClickSlash}>
            /
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.acl_header_spd}>
          <div className={`body-col hs spd hover ${hidden.includes('spd') ? 'hidden' : ''}`}
               onMouseDown={() => toggleHideColumn('spd')}>
            S{!hidden.includes('spd') && 'pd'}{hidden.includes('spd') && any_assigned_speed && '*'}
          </div>
        </EdstTooltip>
        <div className={`body-col special special-header`}/>
        <div className={`body-col special special-header`} disabled={!any_holding}>
          H
        </div>
        <div className={`body-col special special-header`}/>
        <div className={`body-col special special-header`}/>
        <div className="body-col route">
          Route
        </div>
      </div>
    </div>
    <div className="scroll-container">
      {spa_entry_list?.map(([i, e]) =>
        <AclRow
          key={`acl-table-row-spa-${e.cid}`}
          entry={e}
          bottom_border={i % 3 === 2}
          any_holding={any_holding}
          hidden={hidden}
          alt_mouse_down={alt_mouse_down}
          updateVci={updateVci}
        />)}
      {spa_entry_list.length > 0 && <div className="body-row separator"/>}
      {Object.entries(entry_list?.filter(e => (!(typeof (e.spa) === 'number') && ((e.acl_status > -1) || !manual_posting)))?.sort(sortFunc))?.map(([i, e]) =>
        <AclRow
          key={`acl-table-row-ack-${e.cid}`}
          entry={e}
          bottom_border={i % 3 === 2}
          any_holding={any_holding}
          hidden={hidden}
          alt_mouse_down={alt_mouse_down}
          updateVci={updateVci}
        />)}
      {manual_posting && <div className="body-row separator"/>}
      {manual_posting && Object.entries(entry_list?.filter(e => (!(typeof (e.spa) === 'number') && cid_list.has(e.cid) && e.acl_status === -1)))?.map(([i, e]) =>
        <AclRow
          key={`acl-table-row-no-ack-${e.cid}`}
          entry={e}
          bottom_border={i % 3 === 2}
          any_holding={any_holding}
          hidden={hidden}
          alt_mouse_down={alt_mouse_down}
          updateVci={updateVci}
        />)}
    </div>
  </div>);
}
