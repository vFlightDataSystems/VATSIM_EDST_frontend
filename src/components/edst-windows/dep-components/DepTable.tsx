import {useState, useContext} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';
import {DepRow} from "./DepRow";
import {DepContext, EdstContext} from "../../../contexts/contexts";
import {EdstEntryProps} from "../../../interfaces";
import _ from "lodash";
import { useAppSelector } from '../../../redux/hooks';

const COMPLETED_SYMBOL = '✓';

export function DepTable() {
  const [hidden, setHidden] = useState<Array<string>>([]);
  const {
    edst_data,
    updateEntry
  } = useContext(EdstContext);
  const {sort_data, manual_posting} = useContext(DepContext);
  const cid_list = useAppSelector(state => state.dep.cid_list);

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
  };

  const sortFunc = (u: EdstEntryProps, v: EdstEntryProps) => {
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
  };

  const entry_list = Object.values(edst_data)?.filter((entry: EdstEntryProps) => cid_list.includes(entry.cid));

  const spa_entry_list = Object.entries(entry_list.filter((entry: EdstEntryProps) => (_.isNumber(entry.spa))) // @ts-ignore
    ?.sort((u: EdstEntryProps, v: EdstEntryProps) => u.spa - v.spa));

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
      {spa_entry_list?.map(([i, entry]: [string, EdstEntryProps]) =>
        <DepRow
          key={`dep-row-spa-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          updateStatus={updateStatus}
          hidden={hidden}
        />)}
      {spa_entry_list.length > 0 && <div className="body-row separator"/>}
      {Object.entries(entry_list?.filter((entry: EdstEntryProps) => (!(typeof (entry.spa) === 'number') && ((entry.dep_status > -1) || !manual_posting)))
        ?.sort(sortFunc))?.map(([i, entry]: [string, EdstEntryProps]) =>
        <DepRow
          key={`dep-row-ack-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}

          updateStatus={updateStatus}
          hidden={hidden}
        />)}
      {manual_posting && <div className="body-row separator"/>}
      {manual_posting && Object.entries(entry_list?.filter((entry: EdstEntryProps) => (!(typeof (entry.spa) === 'number') && entry.dep_status === -1)))
        ?.map(([i, entry]: [string, EdstEntryProps]) =>
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
