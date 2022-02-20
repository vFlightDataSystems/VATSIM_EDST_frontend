import {useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {AclRow} from "./AclRow";
import VCI from '../../../css/images/VCI_v4.png';
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {EdstEntryType} from "../../../types";
import { useAppSelector } from '../../../redux/hooks';
import {anyAssignedHdgSelector, anyAssignedSpdSelector, anyHoldingSelector} from "../../../redux/selectors";

export function AclTable() {
  const sortData = useAppSelector((state) => state.acl.sortData);
  const manualPosting = useAppSelector((state) => state.acl.manualPosting);

  const anyHolding = useAppSelector(anyHoldingSelector);
  const anyAssignedHeading = useAppSelector(anyAssignedHdgSelector);
  const anyAssignedSpeed = useAppSelector(anyAssignedSpdSelector);
  const [hiddenList, setHiddenList] = useState<string[]>([]);
  const [altMouseDown, setAltMouseDown] = useState(false);
  const entries = useAppSelector(state => state.entries);

  const toggleHideColumn = (name: string) => {
    let hiddenCopy = hiddenList.slice(0);
    const index = hiddenCopy.indexOf(name);
    if (index > -1) {
      hiddenCopy.splice(index, 1);
    } else {
      hiddenCopy.push(name);
    }
    setHiddenList(hiddenCopy);
  };

  const handleClickSlash = () => {
    let hiddenCopy = hiddenList.slice(0);
    if (hiddenCopy.includes('spd') && hiddenCopy.includes('hdg')) {
      hiddenCopy.splice(hiddenCopy.indexOf('spd'), 1);
      hiddenCopy.splice(hiddenCopy.indexOf('hdg'), 1);
    } else {
      if (!hiddenCopy.includes('hdg')) {
        hiddenCopy.push('hdg');
      }
      if (!hiddenCopy.includes('spd')) {
        hiddenCopy.push('spd');
      }
    }
    setHiddenList(hiddenCopy);
  };

  const sortFunc = (u: EdstEntryType, v: EdstEntryType) => {
    switch (sortData.selectedOption) {
      case 'ACID':
        return u.callsign.localeCompare(v.callsign);
      case 'Destination':
        return u.dest.localeCompare(v.dest);
      case 'Origin':
        return u.dep.localeCompare(v.dep);
      case 'Boundary Time':
        return u.boundary_time - v.boundary_time;
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  };

  const entryList = Object.values(entries)?.filter((entry: EdstEntryType) => entry.aclDisplay);
  const spaEntryList = Object.entries(entryList.filter((entry: EdstEntryType) => entry.spa));

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
        <EdstTooltip className="body-col pa header" title={Tooltips.aclHeaderPa} content="PA"/>
        <div className="body-col special special-hidden"/>
        <div className="body-col special special-hidden"/>
        <div className={`body-col type ${hiddenList.includes('type') ? 'hidden' : ''}`}>
          <div className="hover" onMouseDown={() => toggleHideColumn('type')}>
            T{!hiddenList.includes('type') && 'ype'}
          </div>
        </div>
        <div className="body-col alt header hover"
             onMouseDown={() => setAltMouseDown(true)}
             onMouseUp={() => setAltMouseDown(false)}
        >
          Alt.
        </div>
        <div className={`body-col code hover ${hiddenList.includes('code') ? 'hidden' : ''}`}
             onMouseDown={() => toggleHideColumn('code')}>
          C{!hiddenList.includes('code') && 'ode'}
        </div>
        <div className={`body-col special special-header`}/>
        <EdstTooltip title={Tooltips.aclHeaderHdg}>
          <div className={`body-col hs hdg hover ${hiddenList.includes('hdg') ? 'hidden' : ''}`}
               onMouseDown={() => toggleHideColumn('hdg')}>
            {hiddenList.includes('hdg') && anyAssignedHeading && '*'}H{!hiddenList.includes('hdg') && 'dg'}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclHeaderSlash}>
          <div className="body-col hs-slash hover" onMouseDown={handleClickSlash}>
            /
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclHeaderSpd}>
          <div className={`body-col hs spd hover ${hiddenList.includes('spd') ? 'hidden' : ''}`}
               onMouseDown={() => toggleHideColumn('spd')}>
            S{!hiddenList.includes('spd') && 'pd'}{hiddenList.includes('spd') && anyAssignedSpeed && '*'}
          </div>
        </EdstTooltip>
        <div className={`body-col special special-header`}/>
        <div className={`body-col special special-header`}/>
        <div className={`body-col special special-header`} // @ts-ignore
             disabled={!anyHolding}>
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
      {spaEntryList?.map(([i, entry]: [string, EdstEntryType]) =>
        <AclRow
          key={`acl-table-row-spa-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          anyHolding={anyHolding}
          hidden={hiddenList}
          altMouseDown={altMouseDown}
        />)}
      {spaEntryList.length > 0 && <div className="body-row separator"/>}
      {Object.entries(entryList?.filter((entry: EdstEntryType) => (!entry.spa && ((entry.vciStatus > -1) || !manualPosting)))
        ?.sort(sortFunc))?.map(([i, entry]: [string, EdstEntryType]) =>
        <AclRow
          key={`acl-table-row-ack-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          anyHolding={anyHolding}
          hidden={hiddenList}
          altMouseDown={altMouseDown}
        />)}
      {manualPosting && <div className="body-row separator"/>}
      {manualPosting && Object.entries(entryList?.filter((entry: EdstEntryType) => (!entry.spa && entry.vciStatus === -1)))
        ?.map(([i, entry]: [string, EdstEntryType]) =>
          <AclRow
            key={`acl-table-row-no-ack-${entry.cid}-${i}`}
            index={Number(i)}
            entry={entry}
            anyHolding={anyHolding}
            hidden={hiddenList}
            altMouseDown={altMouseDown}
          />)}
    </div>
  </div>);
}
