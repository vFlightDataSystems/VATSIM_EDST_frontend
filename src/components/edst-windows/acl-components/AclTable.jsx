import {useContext, useEffect, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {AclRow} from "./AclRow";
import {AclContext, EdstContext} from "../../../contexts/contexts";

export default function AclTable(props) {
  const [any_holding, setAnyHolding] = useState(false);
  const [hidden, setHidden] = useState([]);
  const [alt_mouse_down, setAltMouseDown] = useState(false);
  const {
    edst_data,
    updateEntry,
  } = useContext(EdstContext);
  const {cid_list, sort_data} = useContext(AclContext);
  useEffect(() => {
  }, [edst_data]);

  const checkHolding = () => {
    for (let cid of cid_list) {
      if (edst_data[cid]?.hold_data) {
        setAnyHolding(true);
        return;
      }
    }
    setAnyHolding(false);
  }
  useEffect(() => checkHolding());

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
    const spd_index = hidden_copy.indexOf('spd');
    const hdg_index = hidden_copy.indexOf('hdg');
    if (spd_index > 0 && hdg_index > 0) {
      hidden_copy.splice(spd_index, 1);
      hidden_copy.splice(hdg_index, 1);
      setHidden(hidden_copy);
    } else {
      hidden_copy.push('spd');
      hidden_copy.push('hdg');
      setHidden([...new Set(hidden_copy)]);
    }
  }

  const updateStatus = (cid) => {
    const entry = edst_data[cid];
    if (entry?.acl_status === -1 && posting_manual) {
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

  const {posting_manual} = props;

  const data = Object.values(edst_data)?.filter(e => cid_list.includes(e.cid));

  return (<div className="acl-body no-select">
    <div className="body-row header" key="acl-table-header">
      <div className="body-col radio-header green">
        N
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
        <div className="body-col pa header">
          <div>
            PA
          </div>
        </div>
        <div className="body-col special special-hidden"/>
        <div className="body-col special rem special-hidden"/>
        <div className={`body-col type ${hidden.includes('type') ? 'hidden' : ''}`}>
          <div onMouseDown={() => toggleHideColumn('type')}>
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
        <div className={`body-col hs hdg hover ${hidden.includes('hdg') ? 'hidden' : ''}`}
             onMouseDown={() => toggleHideColumn('hdg')}>
          H{!hidden.includes('hdg') && 'dg'}
        </div>
        <div className="body-col hs-slash hover" onMouseDown={handleClickSlash}>
          /
        </div>
        <div className={`body-col hs spd hover ${hidden.includes('spd') ? 'hidden' : ''}`}
             onMouseDown={() => toggleHideColumn('spd')}>
          S{!hidden.includes('spd') && 'pd'}
        </div>
        <div className={`body-col special special-header`}/>
        <div className={`body-col special special-header`} disabled={!any_holding}>
          H
        </div>
        <div className={`body-col special special-header`}/>
        <div className="body-col route">
          Route
        </div>
      </div>
    </div>
    <div className="scroll-container">
      {Object.entries(data.filter(e => (typeof (e.spa) === 'number'))?.sort((u, v) => u.spa - v.spa))?.map(([i, e]) =>
        <AclRow
          key={`acl-table-row-spa-${e.cid}`}
          entry={e}
          bottom_border={i % 3 === 2}
          any_holding={any_holding}
          hidden={hidden}
          alt_mouse_down={alt_mouse_down}
          updateStatus={updateStatus}
        />)}
      <div className="body-row separator"/>
      {Object.entries(data?.filter(e => (!(typeof (e.spa) === 'number') && ((e.acl_status > -1) || !posting_manual)))?.sort(sortFunc))?.map(([i, e]) =>
        <AclRow
          key={`acl-table-row-ack-${e.cid}`}
          entry={e}
          bottom_border={i % 3 === 2}
          any_holding={any_holding}
          hidden={hidden}
          alt_mouse_down={alt_mouse_down}
          updateStatus={updateStatus}
        />)}
      {posting_manual && <div className="body-row separator"/>}
      {posting_manual && Object.entries(data?.filter(e => (!(typeof (e.spa) === 'number') && cid_list.includes(e.cid) && e.acl_status === -1)))?.map(([i, e]) =>
        <AclRow
          key={`acl-table-row-no-ack-${e.cid}`}
          entry={e}
          bottom_border={i % 3 === 2}
          any_holding={any_holding}
          hidden={hidden}
          alt_mouse_down={alt_mouse_down}
          updateStatus={updateStatus}
        />)}
    </div>
  </div>);
}
