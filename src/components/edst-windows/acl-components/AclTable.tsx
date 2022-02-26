import {useState} from 'react';
import '../../../css/windows/body-styles.scss';
import '../../../css/windows/acl-styles.scss';
import {AclRow} from "./AclRow";
import VCI from '../../../css/images/VCI_v4.png';
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {LocalEdstEntryType} from "../../../types";
import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
import {anyAssignedHdgSelector, anyAssignedSpdSelector, anyHoldingSelector} from "../../../redux/selectors";
import {aclRowFieldEnum, sortOptionsEnum, windowEnum} from "../../../enums";
import {aselSelector, closeWindow, setAsel} from "../../../redux/slices/appSlice";

export function AclTable() {
  const sortData = useAppSelector((state) => state.acl.sortData);
  const manualPosting = useAppSelector((state) => state.acl.manualPosting);
  const dispatch = useAppDispatch();

  const asel = useAppSelector(aselSelector);
  const anyHolding = useAppSelector(anyHoldingSelector);
  const anyAssignedHeading = useAppSelector(anyAssignedHdgSelector);
  const anyAssignedSpeed = useAppSelector(anyAssignedSpdSelector);
  const [hiddenList, setHiddenList] = useState<aclRowFieldEnum[]>([]);
  const [altMouseDown, setAltMouseDown] = useState(false);
  const entries = useAppSelector(state => state.entries);

  const toggleHideColumn = (field: aclRowFieldEnum) => {
    let hiddenCopy = hiddenList.slice(0);
    const index = hiddenCopy.indexOf(field);
    if (index > -1) {
      hiddenCopy.splice(index, 1);
    } else {
      hiddenCopy.push(field);
      if (asel?.field === field) {
        dispatch(setAsel(null));
      }
    }
    setHiddenList(hiddenCopy);
  };

  const handleClickSlash = () => {
    let hiddenCopy = hiddenList.slice(0);
    if (hiddenCopy.includes(aclRowFieldEnum.spd) && hiddenCopy.includes(aclRowFieldEnum.hdg)) {
      hiddenCopy.splice(hiddenCopy.indexOf(aclRowFieldEnum.spd), 1);
      hiddenCopy.splice(hiddenCopy.indexOf(aclRowFieldEnum.hdg), 1);
      if (asel?.field as aclRowFieldEnum === aclRowFieldEnum.spd) {
        dispatch(closeWindow(windowEnum.speedMenu));
        dispatch(setAsel(null));
      }
      if (asel?.field as aclRowFieldEnum === aclRowFieldEnum.hdg) {
        dispatch(closeWindow(windowEnum.headingMenu));
        dispatch(setAsel(null));
      }
    } else {
      if (!hiddenCopy.includes(aclRowFieldEnum.hdg)) {
        hiddenCopy.push(aclRowFieldEnum.hdg);
        if (asel?.field as aclRowFieldEnum === aclRowFieldEnum.hdg) {
          dispatch(closeWindow(windowEnum.headingMenu));
          dispatch(setAsel(null));
        }
      }
      if (!hiddenCopy.includes(aclRowFieldEnum.spd)) {
        if (asel?.field as aclRowFieldEnum === aclRowFieldEnum.spd) {
          dispatch(closeWindow(windowEnum.speedMenu));
          dispatch(setAsel(null));
        }
        hiddenCopy.push(aclRowFieldEnum.spd);
      }
    }
    setHiddenList(hiddenCopy);
  };

  const sortFunc = (u: LocalEdstEntryType, v: LocalEdstEntryType) => {
    switch (sortData.selectedOption) {
      case sortOptionsEnum.acid:
        return u.callsign.localeCompare(v.callsign);
      case sortOptionsEnum.destination:
        return u.dest.localeCompare(v.dest);
      case sortOptionsEnum.origin:
        return u.dep.localeCompare(v.dep);
      case sortOptionsEnum.boundaryTime:
        return u.boundaryTime - v.boundaryTime;
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  };

  const entryList = Object.values(entries)?.filter((entry: LocalEdstEntryType) => entry.aclDisplay);
  const spaEntryList = Object.entries(entryList.filter((entry: LocalEdstEntryType) => entry.spa));

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
        <div className={`body-col type ${hiddenList.includes(aclRowFieldEnum.type) ? 'hidden' : ''}`}>
          <div className="hover" onMouseDown={() => toggleHideColumn(aclRowFieldEnum.type)}>
            T{!hiddenList.includes(aclRowFieldEnum.type) && 'ype'}
          </div>
        </div>
        <div className="body-col alt header hover"
             onMouseDown={() => setAltMouseDown(true)}
             onMouseUp={() => setAltMouseDown(false)}
        >
          Alt.
        </div>
        <div className={`body-col code hover ${hiddenList.includes(aclRowFieldEnum.code) ? 'hidden' : ''}`}
             onMouseDown={() => toggleHideColumn(aclRowFieldEnum.code)}>
          C{!hiddenList.includes(aclRowFieldEnum.code) && 'ode'}
        </div>
        <div className={`body-col special special-header`}/>
        <EdstTooltip title={Tooltips.aclHeaderHdg}>
          <div className={`body-col hs hdg hover ${hiddenList.includes(aclRowFieldEnum.hdg) ? 'hidden' : ''}`}
               onMouseDown={() => toggleHideColumn(aclRowFieldEnum.hdg)}>
            {hiddenList.includes(aclRowFieldEnum.hdg) && anyAssignedHeading && '*'}H{!hiddenList.includes(aclRowFieldEnum.hdg) && 'dg'}
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclHeaderSlash}>
          <div className="body-col hs-slash hover" onMouseDown={handleClickSlash}>
            /
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclHeaderSpd}>
          <div className={`body-col hs spd hover ${hiddenList.includes(aclRowFieldEnum.spd) ? 'hidden' : ''}`}
               onMouseDown={() => toggleHideColumn(aclRowFieldEnum.spd)}>
            S{!hiddenList.includes(aclRowFieldEnum.spd) && 'pd'}{hiddenList.includes(aclRowFieldEnum.spd) && anyAssignedSpeed && '*'}
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
      {spaEntryList?.map(([i, entry]: [string, LocalEdstEntryType]) =>
        <AclRow
          key={`acl-table-row-spa-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          anyHolding={anyHolding}
          hidden={hiddenList}
          altMouseDown={altMouseDown}
        />)}
      {spaEntryList.length > 0 && <div className="body-row separator"/>}
      {Object.entries(entryList?.filter((entry: LocalEdstEntryType) => (!entry.spa && ((entry.vciStatus > -1) || !manualPosting)))
        ?.sort(sortFunc))?.map(([i, entry]: [string, LocalEdstEntryType]) =>
        <AclRow
          key={`acl-table-row-ack-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          anyHolding={anyHolding}
          hidden={hiddenList}
          altMouseDown={altMouseDown}
        />)}
      {manualPosting && <div className="body-row separator"/>}
      {manualPosting && Object.entries(entryList?.filter((entry: LocalEdstEntryType) => (!entry.spa && entry.vciStatus === -1)))
        ?.map(([i, entry]: [string, LocalEdstEntryType]) =>
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
