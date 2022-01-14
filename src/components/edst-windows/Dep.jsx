import {useState, useEffect} from 'react';
import '../../css/windows/dep-styles.scss';
import DepHeader from "./dep-components/DepHeader";
import DepTable from "./dep-components/DepTable";

export function Dep(props) {
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
      sort_data={props.sort_data}
      openMenu={props.openMenu}
      asel={props.asel}
      focused={focused} posting_manual={posting_manual}
      closeWindow={props.closeWindow}
      togglePosting={() => setPostingManual(!posting_manual)}
    />
    <DepTable
      posting_manual={posting_manual}
    />
  </div>);
}
