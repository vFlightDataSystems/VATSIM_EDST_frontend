import { useContext, useEffect, useState } from 'react';
import { EdstContext } from "../../contexts/contexts";
import '../../css/header-styles.scss';
import '../../css/windows/plans-display-styles.scss';
import {PlansDisplayHeader} from "./plans-display-components/PlansDisplayHeader";
import {PlansDisplayTable} from "./plans-display-components/PlansDisplayTable";

export function PlansDisplay(props) {
  const { amendEntry } = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const [selected_msg_index, setSelectedMsgIndex] = useState(null);
  const unmount = () => props.unmount();
  useEffect(() => {
    return () => unmount();
    // eslint-disable-next-line
  }, []);
  const {plan_queue} = props;

  return (<div
    className={`plans-display ${props.dragging ? 'dragging' : ''}`}
    // style={{zIndex: props.z_index}}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <div>
      <PlansDisplayHeader
        cleanup={props.cleanup}
        openMenu={props.openMenu}
        amendEntry={amendEntry}
        plan_data={selected_msg_index ? plan_queue[selected_msg_index] : null}
        asel={props.asel}
        focused={focused}
        closeWindow={props.closeWindow}
      />
      <PlansDisplayTable
        messageSelect={(i) => setSelectedMsgIndex(i)}
        selected_msg={selected_msg_index}
        plan_queue={plan_queue}
        asel={props.asel}
        aircraftSelect={props.aircraftSelect}
      />
    </div>
  </div>);
}
