import React, {useState} from 'react';
import '../../css/windows/dep-styles.scss';
import {DepHeader} from "./dep-components/DepHeader";
import {DepTable} from "./dep-components/DepTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";

export const Dep: React.FC = () => {
  const dragging = useAppSelector(draggingSelector);
  const [focused, setFocused] = useState(false);

  return (<div
    className={`dep ${dragging ? 'dragging' : ''}`}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <DepHeader focused={focused}/>
    <DepTable/>
  </div>);
};
