import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {EdstContext} from "../../contexts/contexts";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {setAclSort} from "../../redux/slices/aclSlice";
import {setDepSort} from "../../redux/slices/depSlice";
import {sortOptionsEnum, windowEnum} from "../../enums";
import {closeWindow, windowSelector} from "../../redux/slices/appSlice";

export const SortMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const windowProps = useAppSelector(windowSelector(windowEnum.sortMenu));
  const window = windowProps.openedBy === windowEnum.dep ? 'dep' : 'acl';
  const {startDrag, stopDrag} = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const sortData = useAppSelector((state) => state[window].sortData);
  const [sortState, setSortState] = useState(Object.assign({}, sortData));
  const ref = useRef(null);
  let sortStateCopy = Object.assign({}, sortState);

  return windowProps?.position && (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className={`options-menu no-select sort-${window}`}
      ref={ref}
      id="sort-menu"
      style={{left: windowProps.position.x, top: windowProps.position.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, windowEnum.sortMenu)}
           onMouseUp={(event) => stopDrag(event)}
      >
        Sort Menu
      </div>
      <div className="options-body sort">
        {window === 'acl' && <div className="options-row sector">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.sector = !sortState.sector;
                         setSortState(sortStateCopy);
                       }}
                       title={Tooltips.sortAclSectorNonSector}
          >
            <div className={`box ${sortState.sector ? 'selected' : ''}`}/>
            Sector/Non-Sector
          </EdstTooltip>
        </div>}
        <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.selectedOption = sortOptionsEnum.acid;
                         setSortState(sortStateCopy);
                       }}
                       title={Tooltips.sortAcid}
          >
            <div className={`box diamond ${sortState?.selectedOption === 'ACID' ? 'selected' : ''}`}/>
            ACID
          </EdstTooltip>
        </div>
        {window === 'acl' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.selectedOption = sortOptionsEnum.boundaryTime;
                         setSortState(sortStateCopy);
                       }} // @ts-ignore
                       title={Tooltips.sortBoundaryTime}
          >
            <div className={`box diamond ${sortStateCopy?.selectedOption === sortOptionsEnum.boundaryTime ? 'selected' : ''}`}/>
            Boundary Time
          </EdstTooltip>
        </div>}
        {window === 'acl' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.selectedOption = sortOptionsEnum.conflictStatus;
                         setSortState(sortStateCopy);
                       }} // @ts-ignore
                       disabled={true}
                       title={Tooltips.sortConflictStatus}
          >
            <div className={`box diamond ${sortState?.selectedOption === sortOptionsEnum.conflictStatus ? 'selected' : ''}`}/>
            Conflict Status
          </EdstTooltip>
        </div>}
        {window === 'acl' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.selectedOption = sortOptionsEnum.conflictTime;
                         setSortState(sortStateCopy);
                       }}
            // @ts-ignore
                       disabled={true}
                       title={Tooltips.sortConflictTime}
          >
            <div className={`box diamond ${sortState?.selectedOption === sortOptionsEnum.conflictTime ? 'selected' : ''}`}/>
            Conflict Time
          </EdstTooltip>
        </div>}
        <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.selectedOption = sortOptionsEnum.destination;
                         setSortState(sortStateCopy);
                       }}
                       title={Tooltips.sortDestination}
          >
            <div className={`box diamond ${sortState?.selectedOption === sortOptionsEnum.destination ? 'selected' : ''}`}/>
            Destination
          </EdstTooltip>
        </div>
        {window === 'acl' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.selectedOption = sortOptionsEnum.sectorBySector;
                         setSortState(sortStateCopy);
                       }}
            // @ts-ignore
                       disabled={true}
                       title={Tooltips.sortSectorBySector}
          >
            <div className={`box diamond ${sortState?.selectedOption === sortOptionsEnum.sectorBySector ? 'selected' : ''}`}/>
            Sector-by-Sector
          </EdstTooltip>
        </div>}
        {window === 'dep' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.selectedOption = sortOptionsEnum.origin;
                         setSortState(sortStateCopy);
                       }}
                       title={Tooltips.sortOrigin}
          >
            <div className={`box diamond ${sortState?.selectedOption === sortOptionsEnum.origin ? 'selected' : ''}`}/>
            Origin
          </EdstTooltip>
        </div>}
        {window === 'dep' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.selectedOption = sortOptionsEnum.pTime;
                         setSortState(sortStateCopy);
                       }}
            // @ts-ignore
                       disabled={true}
                       title={Tooltips.sortPTime}
          >
            <div className={`box diamond ${sortState?.selectedOption === sortOptionsEnum.pTime ? 'selected' : ''}`}/>
            P-Time
          </EdstTooltip>
        </div>}
        <div className="options-row bottom margin-top">
          <div className="options-col left">
            <EdstButton content="OK" onMouseDown={() => {
              dispatch(window === 'acl' ? setAclSort({selectedOption: sortState.selectedOption, sector: sortState.sector}) : setDepSort(sortState.selectedOption));
              dispatch(closeWindow(windowEnum.sortMenu));
            }}/>
          </div>
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit" onMouseDown={() => dispatch(closeWindow(windowEnum.sortMenu))}/>
          </div>
        </div>
      </div>
    </div>
  );
};
