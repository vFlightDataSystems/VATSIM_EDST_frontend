import {useState, useContext} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';
import {DepRow} from "./DepRow";
import {EdstContext} from "../../../contexts/contexts";
import {EdstEntryType} from "../../../types";
import _ from "lodash";
import { useAppSelector } from '../../../redux/hooks';

const COMPLETED_SYMBOL = '✓';

export function DepTable() {
  const sortData = useAppSelector((state) => state.dep.sortData);
  const manualPosting = useAppSelector((state) => state.dep.manualPosting);

  const [hidden, setHidden] = useState<string[]>([]);
  const {
    entries,
    updateEntry
  } = useContext(EdstContext);
  const cidList = useAppSelector(state => state.dep.cidList);

  const toggleHideColumn = (name: string) => {
    let hidden_copy = hidden.slice(0);
    const index = hidden_copy.indexOf(name);
    if (index > -1) {
      hidden_copy.splice(index, 1);
    } else {
      hidden_copy.push(name);
    }
    setHidden(hidden_copy);
  };

  const updateStatus = (cid: string) => {
    const entry = entries[cid];
    if (entry?.depStatus === -1) {
      updateEntry(cid, {depStatus: 0});
    } else {
      if (entry?.depStatus < 1) {
        updateEntry(cid, {depStatus: 1});
      } else {
        updateEntry(cid, {depStatus: 0});
      }
    }
  };

  const sortFunc = (u: EdstEntryType, v: EdstEntryType) => {
    switch (sortData.name) {
      case 'ACID':
        return u.callsign.localeCompare(v.callsign);
      case 'Destination':
        return u.dest.localeCompare(v.dest);
      case 'Origin':
        return u.dep?.localeCompare(v.dep);
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  };

  const entry_list = Object.values(entries)?.filter((entry: EdstEntryType) => cidList.includes(entry.cid));

  const spa_entry_list = Object.entries(entry_list.filter((entry: EdstEntryType) => (_.isNumber(entry.spa))) // @ts-ignore
    ?.sort((u: EdstEntryType, v: EdstEntryType) => u.spa - v.spa));

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
      <div className="body-col special special-hidden"/>
      <div className={`body-col type dep-type ${hidden.includes('type') ? 'hidden' : ''}`}>
        <div className="hover" onMouseDown={() => toggleHideColumn('type')}>
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
      {spa_entry_list?.map(([i, entry]: [string, EdstEntryType]) =>
        <DepRow
          key={`dep-row-spa-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          updateStatus={updateStatus}
          hidden={hidden}
        />)}
      {spa_entry_list.length > 0 && <div className="body-row separator"/>}
      {Object.entries(entry_list?.filter((entry: EdstEntryType) => (!(typeof (entry.spa) === 'number') && ((entry.depStatus > -1) || !manualPosting)))
        ?.sort(sortFunc))?.map(([i, entry]: [string, EdstEntryType]) =>
        <DepRow
          key={`dep-row-ack-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}

          updateStatus={updateStatus}
          hidden={hidden}
        />)}
      {manualPosting && <div className="body-row separator"/>}
      {manualPosting && Object.entries(entry_list?.filter((entry: EdstEntryType) => (!(typeof (entry.spa) === 'number') && entry.depStatus === -1)))
        ?.map(([i, entry]: [string, EdstEntryType]) =>
          <DepRow
            key={`dep-row-no-ack-${entry.cid}-${i}`}
            index={Number(i)}
            entry={entry}
            updateStatus={updateStatus}
            hidden={hidden}
          />)}
    </div>
  </div>);
}
