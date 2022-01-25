import '../../css/resources/button.scss';
import {useState} from "react";

export function EdstButton(props) {
  const [tooltip_enabled, setTooltipEnabled] = useState(false);

  // if one sets the disabled property on the child of a Tooltip, it won't trigger mouse events,
  // but I want to display the tooltip even if the button is disabled, hence the disabled class...
  return (<div className={`edst-outer-button ${props.className ?? ''} ${props.disabled ? 'disabled' : ''}`}
               onMouseEnter={(e) => e.shiftKey && setTooltipEnabled(true)}
               onMouseLeave={() => setTooltipEnabled(false)}
               title={tooltip_enabled ? props.tooltip : ''}
  >
    <div className={`edst-inner-button ${props.selected ? 'selected' : ''}`}
         disabled={props.disabled}
         id={props.id}
         onMouseDown={props.onMouseDown}
    >
      {props.content}
    </div>
  </div>);
}

export function EdstWindowHeaderButton(props) {
  return <EdstButton {...props} className="window-header-button"/>
}