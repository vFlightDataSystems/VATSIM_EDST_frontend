import {useState, useEffect} from 'react';
import '../../css/windows/dep-styles.scss';
import DepHeader from "./dep-components/DepHeader";
import DepTable from "./dep-components/DepTable";

export function Dep(props) {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    return () => props.unmount();
    // eslint-disable-next-line
  }, []);

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
      focused={focused}
      closeWindow={props.closeWindow}
    />
    <DepTable
    />
  </div>);
}
