import React, {useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/plans-display-styles.scss';
import {PlansDisplayHeader} from "./plans-display-components/PlansDisplayHeader";
import {PlansDisplayTable} from "./plans-display-components/PlansDisplayTable";
import {useAppSelector} from "../../redux/hooks";

export const PlansDisplay: React.FC = () => {
  const dragging = useAppSelector((state) => state.app.dragging);
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
