import React, {useEffect, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';
import {DepRow} from "./DepRow";
import {DepContext, EdstContext} from "../../../contexts/contexts";

const COMPLETED_SYMBOL = '✓';

export default function DepTable(props) {
  const [hidden, setHidden] = useState([]);
  const {
    edst_data,
    updateEntry
  } = React.useContext(EdstContext);
  const {cid_list, sort_data} = React.useContext(DepContext);
  useEffect(() => {}, [edst_data]);

  const toggleHideColumn = (name) => {
    const index = hidden.indexOf(name);
    if (index > -1) {
      hidden.splice(index, 1);
    } else {
      hidden.push(name);
    }
    setHidden(hidden);
  }

  const updateStatus = (cid) => {
    const entry = edst_data[cid];
    if (entry?.dep_status === -1) {
      updateEntry(cid, {dep_status: 0});
    } else {
      if (entry?.dep_status < 1) {
        updateEntry(cid, {dep_status: 1});
      } else {
        updateEntry(cid, {dep_status: 0});
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
        return u.dep?.localeCompare(v.dep);
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  }

    const {posting_manual} = props;

    const data = Object.values(edst_data)?.filter(e => cid_list.includes(e.cid));

    return (<div className="dep-body no-select">
      <div className="body-row header" key="dep-table-header">
        <div className="body-col radio-header checkmark">
          {COMPLETED_SYMBOL}
        </div>
        <div className="body-col body-col-2">
          P Time
        </div>
        <div className="body-col fid dep-fid">
          Flight ID
        </div>
        <div className="body-col pa header"/>
        <div className="body-col special special-hidden"/>
        <div className="body-col special rem special-hidden"/>
        <div className={`body-col type dep-type ${hidden.includes('type') ? 'hidden' : ''}`}>
          <div onMouseDown={() => toggleHideColumn('type')}>
            T{!hidden.includes('type') && 'ype'}
          </div>
        </div>
        <div className="body-col alt header">
          <div>Alt.</div>
        </div>
        <div className={`body-col code hover ${hidden.includes('code') ? 'hidden' : ''}`}
             onMouseDown={() => toggleHideColumn('code')}>
          C{!hidden.includes('code') && 'ode'}
        </div>
        <div className="body-col route">
          Route
        </div>
      </div>
      <div className="scroll-container">
        {Object.entries(data.filter(e => (typeof(e.spa) === 'number'))?.sort((u,v) => u.spa - v.spa))?.map(([i, e]) =>
          <DepRow
            key={`dep-row-spa-${e.cid}`}
            entry={e}
            bottom_border={i % 3 === 2}
            updateStatus={updateStatus}
            hidden={hidden}
          />)}
        <div className="body-row separator"/>
        {Object.entries(data?.filter(e => (!(typeof(e.spa) === 'number') && ((e.dep_status > -1) || !posting_manual)))?.sort(sortFunc))?.map(([i, e]) =>
          <DepRow
            key={`dep-row-ack-${e.cid}`}
            entry={e}
            bottom_border={i % 3 === 2}
            updateStatus={updateStatus}
            hidden={hidden}
          />)}
        {posting_manual && <div className="body-row separator"/>}
        {posting_manual && Object.entries(data?.filter(e => (!(typeof(e.spa) === 'number') && e.dep_status === -1)))?.map(([i ,e]) =>
          <DepRow
            key={`dep-row-no-ack-${e.cid}`}
            entry={e}
            bottom_border={i % 3 === 2}
            updateStatus={updateStatus}
            hidden={hidden}
          />)}
      </div>
    </div>);
}
