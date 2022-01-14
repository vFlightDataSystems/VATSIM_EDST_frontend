import {useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export function SortMenu(props) {
  const [focused, setFocused] = useState(false);
  const [sort_data, setSortData] = useState(props.sort_data);
  const ref = useRef(null);

  const {pos, ref_id} = props;
  const acl = ref_id === 'acl-sort-button';
  const dep = ref_id === 'dep-sort-button';
  const selected = acl ? sort_data.acl : sort_data.dep;
  let sort_data_copy = Object.assign({}, sort_data);

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu no-select"
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
        {acl && <div className="options-row sector">
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
                 sort_data_copy[acl ? 'acl' : 'dep'].name = 'ACID';
                 setSortData(sort_data_copy);
               }}
          >
            <div className={`box diamond ${selected?.name === 'ACID' ? 'selected' : ''}`}/>
            ACID
          </div>
        </div>
        <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy[acl ? 'acl' : 'dep'].name = 'Destination';
                 setSortData(sort_data_copy);
               }}
          >
            <div className={`box diamond ${selected?.name === 'Destination' ? 'selected' : ''}`}/>
            Destination
          </div>
        </div>
        <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy[acl ? 'acl' : 'dep'].name = 'Origin';
                 setSortData(sort_data_copy);
               }}
          >
            <div className={`box diamond ${selected?.name === 'Origin' ? 'selected' : ''}`}/>
            Origin
          </div>
        </div>
        {dep && <div className="options-row">
          <div className="options-col sort"
               onMouseDown={() => {
                 sort_data_copy.dep.name = 'P-Time';
                 setSortData(sort_data_copy);
               }}
          >
            <div className={`box diamond ${selected?.name === 'P-Time' ? 'selected' : ''}`}/>
            P-Time
          </div>
        </div>}
        <div className="options-row bottom sort">
          <div className="options-col left">
            <button
              onMouseDown={() => {
                props.setSorting(sort_data);
                props.closeWindow();
              }}
            >
              OK
            </button>
          </div>
          <div className="options-col right">
            <button onMouseDown={props.closeWindow}>
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}