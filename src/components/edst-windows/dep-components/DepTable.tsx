import {useMemo, useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/dep-styles.scss';
import {DepRow} from "./DepRow";
import {LocalEdstEntryType} from "../../../types";
import {useAppSelector} from '../../../redux/hooks';
import {sortOptionsEnum} from "../../../enums";

const COMPLETED_SYMBOL = '✓';

export function DepTable() {
  const sortData = useAppSelector((state) => state.dep.sortData);
  const manualPosting = useAppSelector((state) => state.dep.manualPosting);
  const entries = useAppSelector(state => state.entries);
  const [hidden, setHidden] = useState<string[]>([]);

  const toggleHideColumn = (name: string) => {
    let hiddenCopy = hidden.slice(0);
    const index = hiddenCopy.indexOf(name);
    if (index > -1) {
      hiddenCopy.splice(index, 1);
    } else {
      hiddenCopy.push(name);
    }
    setHidden(hiddenCopy);
  };

  const sortFunc = (u: LocalEdstEntryType, v: LocalEdstEntryType) => {
    switch (sortData.selectedOption) {
      case sortOptionsEnum.acid:
        return u.callsign.localeCompare(v.callsign);
      case sortOptionsEnum.destination:
        return u.dest.localeCompare(v.dest);
      case sortOptionsEnum.origin:
        return u.dep?.localeCompare(v.dep);
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  };

  const entryList = useMemo(() => Object.values(entries)?.filter((entry: LocalEdstEntryType) => entry.depDisplay), [entries]);
  const spaEntryList = useMemo(() => Object.entries(entryList.filter((entry: LocalEdstEntryType) => entry.spa)), [entryList]);

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
      <div className="body-col special-box special-hidden"/>
      <div className="body-col special-box special-hidden"/>
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
      {spaEntryList?.map(([i, entry]: [string, LocalEdstEntryType]) =>
        <DepRow
          key={`dep-row-spa-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          hidden={hidden}
        />)}
      {spaEntryList.length > 0 && <div className="body-row separator"/>}
      {Object.entries(entryList?.filter((entry: LocalEdstEntryType) => (!entry.spa && ((entry.depStatus > -1) || !manualPosting)))
        ?.sort(sortFunc))?.map(([i, entry]: [string, LocalEdstEntryType]) =>
        <DepRow
          key={`dep-row-ack-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          hidden={hidden}
        />)}
      {manualPosting && <div className="body-row separator"/>}
      {manualPosting && Object.entries(entryList?.filter((entry: LocalEdstEntryType) => (!entry.spa && entry.depStatus === -1)))
        ?.map(([i, entry]: [string, LocalEdstEntryType]) =>
          <DepRow
            key={`dep-row-no-ack-${entry.cid}-${i}`}
            index={Number(i)}
            entry={entry}
            hidden={hidden}
          />)}
    </div>
  </div>);
}
