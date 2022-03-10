import React, {useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/plans-display-styles.scss';
import {PlansDisplayHeader} from "./plans-display-components/PlansDisplayHeader";
import {PlansDisplayTable} from "./plans-display-components/PlansDisplayTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";

export const PlansDisplay: React.FC = () => {
  const dragging = useAppSelector(draggingSelector);
  const [focused, setFocused] = useState(false);

  return (<div
    className={`plans-display ${dragging ? 'dragging' : ''}`}
    // style={{zIndex: props.z_index}}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <div>
      <PlansDisplayHeader
        focused={focused}
      />
      <PlansDisplayTable/>
    </div>
  </div>);
};
