import React, {useRef} from 'react';
import '../../css/windows/dep-styles.scss';
import {DepHeader} from "./dep-components/DepHeader";
import {DepTable} from "./dep-components/DepTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";

export const Dep: React.FC = () => {
  const dragging = useAppSelector(draggingSelector);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);

  return (<div className={`dep ${dragging ? 'dragging' : ''}`} ref={ref}>
    <DepHeader focused={focused}/>
    <DepTable/>
  </div>);
};
