import React from 'react';
import '../../css/resources/tooltip.scss';
import {useAppSelector} from "../../redux/hooks";

const TooltipContent: React.FC<{content: any}> = (props) => {
  return (<div className="tooltip-content" tabIndex={999}>
    {props.content}
  </div>);
}

type EdstTooltipProps = {
    title?: string,
    className?: string,
    content?: string,
    onMouseDown?: React.EventHandler<React.MouseEvent>,
    onContextMenu?: React.EventHandler<React.MouseEvent>,
    disabled?: boolean
}

export const EdstTooltip: React.FC<EdstTooltipProps> = ({title, content, ...props}) => {
  const globalTooltipsEnabled = useAppSelector((state) => state.app.tooltipsEnabled);
  const [tooltipEnabled, setTooltipEnabled] = React.useState(false);

  return (<span
    {...props}
    onMouseEnter={(e) => e.shiftKey && setTooltipEnabled(true)}
    // onKeyDownCapture={(e) => e.shiftKey && setTooltipEnabled(!tooltip_enabled)}
    onMouseLeave={() => setTooltipEnabled(false)}
  >
        {globalTooltipsEnabled && (tooltipEnabled) && title &&
        <TooltipContent content={title}/>}
    {content ?? props.children}
    </span>);
}
