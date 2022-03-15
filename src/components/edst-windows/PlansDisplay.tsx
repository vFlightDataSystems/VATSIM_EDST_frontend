import React, {useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/plans-display-styles.scss';
import {PlansDisplayHeader} from "./plans-display-components/PlansDisplayHeader";
import {PlansDisplayTable} from "./plans-display-components/PlansDisplayTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";

export const PlansDisplay: React.FC = () => {
  const dragging = useAppSelector(draggingSelector);
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);

  return (<div
    className={`plans-display ${dragging ? 'dragging' : ''}`}
    ref={ref}
    // style={{zIndex: props.z_index}}
  >
    <div>
      <PlansDisplayHeader
        focused={focused}
      />
      <PlansDisplayTable/>
    </div>
  </div>);
};
