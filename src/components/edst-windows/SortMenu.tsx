import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {EdstContext} from "../../contexts/contexts";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {setAclSort} from "../../redux/reducers/aclReducer";
import {setDepSort} from "../../redux/reducers/depReducer";

interface SortMenuProps {
  ref_id: string | null;
  pos: { x: number, y: number };
  closeWindow: () => void;
}

export const SortMenu: React.FC<SortMenuProps> = ({pos, ref_id, ...props}) => {
  const window = ref_id === 'acl-sort-button' ? 'acl' : 'dep';
  const {startDrag, stopDrag} = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const sortData: {name: string, sector: boolean} = useAppSelector((state) => state[window].sortData);
  const dispatch = useAppDispatch();
  const [sortState, setSortState] = useState(Object.assign({}, sortData));
  const ref = useRef(null);
  let sortStateCopy = Object.assign({}, sortState);

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className={`options-menu no-select sort-${window}`}
      ref={ref}
      id="sort-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref)}
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
                         sortStateCopy.name = 'ACID';
                         setSortState(sortStateCopy);
                       }}
                       title={Tooltips.sortAcid}
          >
            <div className={`box diamond ${sortState?.name === 'ACID' ? 'selected' : ''}`}/>
            ACID
          </EdstTooltip>
        </div>
        {window === 'acl' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.name = 'Boundary Time';
                         setSortState(sortStateCopy);
                       }} // @ts-ignore
                       title={Tooltips.sortBoundaryTime}
          >
            <div className={`box diamond ${sortStateCopy?.name === 'Boundary Time' ? 'selected' : ''}`}/>
            Boundary Time
          </EdstTooltip>
        </div>}
        {window === 'acl' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.name = 'Conflict Status';
                         setSortState(sortStateCopy);
                       }} // @ts-ignore
                       disabled={true}
                       title={Tooltips.sortConflictStatus}
          >
            <div className={`box diamond ${sortState?.name === 'Conflict Status' ? 'selected' : ''}`}/>
            Conflict Status
          </EdstTooltip>
        </div>}
        {window === 'acl' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.name = 'Conflict Time';
                         setSortState(sortStateCopy);
                       }}
            // @ts-ignore
                       disabled={true}
                       title={Tooltips.sortConflictTime}
          >
            <div className={`box diamond ${sortState?.name === 'Conflict Time' ? 'selected' : ''}`}/>
            Conflict Time
          </EdstTooltip>
        </div>}
        <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.name = 'Destination';
                         setSortState(sortStateCopy);
                       }}
                       title={Tooltips.sortDestination}
          >
            <div className={`box diamond ${sortState?.name === 'Destination' ? 'selected' : ''}`}/>
            Destination
          </EdstTooltip>
        </div>
        {window === 'acl' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.name = 'Sector-by-Sector';
                         setSortState(sortStateCopy);
                       }}
            // @ts-ignore
                       disabled={true}
                       title={Tooltips.sortSectorBySector}
          >
            <div className={`box diamond ${sortState?.name === 'Sector-by-Sector' ? 'selected' : ''}`}/>
            Sector-by-Sector
          </EdstTooltip>
        </div>}
        {window === 'dep' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.name = 'Origin';
                         setSortState(sortStateCopy);
                       }}
                       title={Tooltips.sortOrigin}
          >
            <div className={`box diamond ${sortState?.name === 'Origin' ? 'selected' : ''}`}/>
            Origin
          </EdstTooltip>
        </div>}
        {window === 'dep' && <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => {
                         sortStateCopy.name = 'P-Time';
                         setSortState(sortStateCopy);
                       }}
            // @ts-ignore
                       disabled={true}
                       title={Tooltips.sortPTime}
          >
            <div className={`box diamond ${sortState?.name === 'P-Time' ? 'selected' : ''}`}/>
            P-Time
          </EdstTooltip>
        </div>}
        <div className="options-row bottom sort">
          <div className="options-col left">
            <EdstButton content="OK" onMouseDown={() => {
              dispatch(window === 'acl' ? setAclSort({name: sortState.name, sector: sortState.sector}) : setDepSort(sortState.name));
              props.closeWindow();
            }}/>
          </div>
          <div className="options-col right">
            <EdstButton content="Exit" onMouseDown={props.closeWindow}/>
          </div>
        </div>
      </div>
    </div>
  );
};
