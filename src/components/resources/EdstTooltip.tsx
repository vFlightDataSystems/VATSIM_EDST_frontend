import * as React from 'react';
import {TooltipContext} from "../../contexts/contexts";
import '../../css/resources/tooltip.scss';
import {FunctionComponent} from "react";

const TooltipContent: FunctionComponent<{content: any}> = (props) => {
  return (<div className="tooltip-content" tabIndex={999}>
    {props.content}
  </div>);
}

interface EdstTooltipProps {
    title?: string;
    className?: string;
    content?: string;
    onMouseDown?: React.EventHandler<any>;
    onContextMenu?: React.EventHandler<any>;
    disabled?: boolean;
}

export const EdstTooltip: React.FunctionComponent<EdstTooltipProps> = ({title, content, ...props}) => {
  const {global_tooltips_enabled, show_all_tooltips} = React.useContext(TooltipContext);
  const [tooltip_enabled, setTooltipEnabled] = React.useState(false);

  return (<span
    {...props}
    onMouseEnter={(e) => e.shiftKey && setTooltipEnabled(true)}
    // onKeyDownCapture={(e) => e.shiftKey && setTooltipEnabled(!tooltip_enabled)}
    onMouseLeave={() => setTooltipEnabled(false)}
  >
        {global_tooltips_enabled && (tooltip_enabled || show_all_tooltips) && title &&
        <TooltipContent content={title}/>}
    {content ?? props.children}
    </span>);
}
