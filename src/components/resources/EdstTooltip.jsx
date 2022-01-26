import {useContext, useState} from "react";
import {TooltipContext} from "../../contexts/contexts";
import '../../css/resources/tooltip.scss';

function TooltipContent(props) {
  return (<div className="tooltip-content" tabIndex={999}>
    {props.content}
  </div>);
}

export function EdstTooltip({title, content, onMouseDown, ...props}) {
  const {global_tooltips_enabled, show_all_tooltips} = useContext(TooltipContext);
  const [tooltip_enabled, setTooltipEnabled] = useState(false);

  return (<span
    {...props}
    onMouseDown={(e) => {
      e.preventDefault();
      onMouseDown(e);
    }}
    onMouseEnter={(e) => e.shiftKey && setTooltipEnabled(true)}
    // onKeyDownCapture={(e) => e.shiftKey && setTooltipEnabled(!tooltip_enabled)}
    onMouseLeave={() => setTooltipEnabled(false)}
  >
        {global_tooltips_enabled && (tooltip_enabled || show_all_tooltips) && title &&
        <TooltipContent content={title}/>}
    {content ?? props.children}
    </span>);
}
