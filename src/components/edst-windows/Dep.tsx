import {useState, useEffect, FunctionComponent, useContext} from 'react';
import '../../css/windows/dep-styles.scss';
import {DepHeader} from "./dep-components/DepHeader";
import {DepTable} from "./dep-components/DepTable";
import {EdstContext} from "../../contexts/contexts";

interface DepProps {
  unmount: () => void;
  closeWindow: () => void;
}

export const Dep: FunctionComponent<DepProps> = (props) => {
  const {dragging} = useContext(EdstContext);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    return () => props.unmount();
    // eslint-disable-next-line
  }, []);

  return (<div
    className={`dep ${dragging ? 'dragging' : ''}`}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <DepHeader
      focused={focused}
      closeWindow={props.closeWindow}
    />
    <DepTable/>
  </div>);
}
