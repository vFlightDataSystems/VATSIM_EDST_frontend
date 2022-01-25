import {useContext, useState} from "react";
import {TooltipContext} from "../../contexts/contexts";

export function EdstTooltip(props) {
  const {global_tooltips_enabled} = useContext(TooltipContext);
  const [tooltip_enabled, setTooltipEnabled] = useState(false);

  return (global_tooltips_enabled ?
    <span className={props.className ?? ''}
          disabled={props.disabled}
          title={tooltip_enabled ? props.tooltip : ''}
          onMouseDown={props.onMouseDown}
          onMouseEnter={(e) => e.shiftKey && setTooltipEnabled(true)}
          onMouseLeave={() => setTooltipEnabled(false)}
    >
      {props.content ?? props.children}
    </span> : props.children);
}