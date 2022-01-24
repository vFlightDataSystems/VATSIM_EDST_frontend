import {useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";

export function SortMenu(props) {
  const [focused, setFocused] = useState(false);
  const [sort_data, setSortData] = useState(props.sort_data);
  const ref = useRef(null);

  const {pos, ref_id} = props;
  const window = ref_id === 'acl-sort-button' ? 'acl' : 'dep';
  const selected = sort_data[window];
  let sort_data_copy = Object.assign({}, sort_data);

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className={`options-menu no-select sort-${window}`}
      ref={ref}
      id="sort-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => props.startDrag(event, ref)}
           onMouseUp={(event) => props.stopDrag(event)}
      >
        Sort Menu
      </div>
      <div className="options-body sort">
        {window === 'acl' && <div className="options-row sector">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy.acl.sector = !selected.sector;
                 setSortData(sort_data_copy);
               }}
          >
            <div className={`box ${selected?.sector === true ? 'selected' : ''}`}/>
            Sector/Non-Sector
          </div>
        </div>}
        <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy[window].name = 'ACID';
                 setSortData(sort_data_copy);
               }}
          >
            <div className={`box diamond ${selected?.name === 'ACID' ? 'selected' : ''}`}/>
            ACID
          </div>
        </div>
        {window === 'acl' && <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy.acl.name = 'Boundary Time';
                 setSortData(sort_data_copy);
               }}
               disabled={true}
          >
            <div className={`box diamond ${selected?.name === 'Boundary Time' ? 'selected' : ''}`}/>
            Boundary Time
          </div>
        </div>}
        {window === 'acl' && <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy.acl.name = 'Conflict Status';
                 setSortData(sort_data_copy);
               }}
               disabled={true}
          >
            <div className={`box diamond ${selected?.name === 'Conflict Status' ? 'selected' : ''}`}/>
            Conflict Status
          </div>
        </div>}
        {window === 'acl' && <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy.acl.name = 'Conflict Time';
                 setSortData(sort_data_copy);
               }}
               disabled={true}
          >
            <div className={`box diamond ${selected?.name === 'Conflict Time' ? 'selected' : ''}`}/>
            Conflict Time
          </div>
        </div>}
        <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy[window].name = 'Destination';
                 setSortData(sort_data_copy);
               }}
          >
            <div className={`box diamond ${selected?.name === 'Destination' ? 'selected' : ''}`}/>
            Destination
          </div>
        </div>
        {window === 'acl' && <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy.acl.name = 'Sector-by-Sector';
                 setSortData(sort_data_copy);
               }}
               disabled={true}
          >
            <div className={`box diamond ${selected?.name === 'Sector-by-Sector' ? 'selected' : ''}`}/>
            Sector-by-Sector
          </div>
        </div>}
        {window === 'dep' && <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy.dep.name = 'Origin';
                 setSortData(sort_data_copy);
               }}
          >
            <div className={`box diamond ${selected?.name === 'Origin' ? 'selected' : ''}`}/>
            Origin
          </div>
        </div>}
        {window === 'dep' && <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy.dep.name = 'P-Time';
                 setSortData(sort_data_copy);
               }}
               disabled={true}
          >
            <div className={`box diamond ${selected?.name === 'P-Time' ? 'selected' : ''}`}/>
            P-Time
          </div>
        </div>}
        <div className="options-row bottom sort">
          <div className="options-col left">
            <EdstButton content="OK" onMouseDown={() => {
              props.setSortData(sort_data);
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
}