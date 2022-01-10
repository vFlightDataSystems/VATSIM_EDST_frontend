import {useState, useEffect} from 'react';
import '../../css/windows/dep-styles.scss';
import DepHeader from "./dep-components/DepHeader";
import DepTable from "./dep-components/DepTable";

export default function Dep(props) {
  const [focused, setFocused] = useState(false);
  const [posting_manual, setPostingManual] = useState(true);

  useEffect(() => props.unmount(), []);

  return (<div
    className={`dep ${props.dragging ? 'dragging' : ''}`}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <DepHeader
      addEntry={props.addEntry}
      sorting={props.sorting}
      openMenu={props.openMenu}
      asel={props.asel}
      focused={focused} posting_manual={posting_manual}
      closeWindow={props.closeWindow}
      togglePosting={() => setPostingManual(!posting_manual)}
    />
    <DepTable
      posting_manual={posting_manual}
      sorting={props.sorting}
      cid_list={props.cid_list}
      edst_data={props.edst_data}
      asel={props.asel}
      updateEntry={props.updateEntry}
      amendEntry={props.amendEntry}
      aircraftSelect={props.aircraftSelect}
      deleteEntry={props.deleteEntry}
    />
  </div>);
}
