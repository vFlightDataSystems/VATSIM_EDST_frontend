import {FunctionComponent, useContext, useEffect, useState} from 'react';
import {EdstContext} from "../../contexts/contexts";
import '../../css/header-styles.scss';
import '../../css/windows/plans-display-styles.scss';
import {PlansDisplayHeader} from "./plans-display-components/PlansDisplayHeader";
import {PlansDisplayTable} from "./plans-display-components/PlansDisplayTable";
import {AselProps} from "../../interfaces";

interface PlansDisplayProps {
  plan_queue: Array<any>;
  asel: AselProps | null;
  unmount: () => void;
  cleanup: () => void;
  closeWindow: () => void;
}

export const PlansDisplay: FunctionComponent<PlansDisplayProps> = ({plan_queue, asel, ...props}) => {
  const {dragging} = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const [selected_msg_index, setSelectedMsgIndex] = useState<string | null>(null);
  const unmount = () => props.unmount();
  useEffect(() => {
    return () => unmount();
    // eslint-disable-next-line
  }, []);

  return (<div
    className={`plans-display ${dragging ? 'dragging' : ''}`}
    // style={{zIndex: props.z_index}}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <div>
      <PlansDisplayHeader
        cleanup={props.cleanup}
        plan_data={selected_msg_index ? plan_queue[Number(selected_msg_index)] : null}
        asel={asel}
        focused={focused}
        closeWindow={props.closeWindow}
      />
      <PlansDisplayTable
        messageSelect={(i: string) => setSelectedMsgIndex(i)}
        selected_msg={selected_msg_index}
        plan_queue={plan_queue}
        asel={asel}
      />
    </div>
  </div>);
};
