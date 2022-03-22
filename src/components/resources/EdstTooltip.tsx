import React from 'react';
import {useAppSelector} from "../../redux/hooks";
import styled from "styled-components";

const TooltipDiv = styled.div`
  position: absolute;
  color: #FFFFFF;
  background-color: #000000;
  border: 1px solid #ADAD00;
  padding: 2px;
  font-size: 0.85em;
  transform: translateY(32px);
  z-index: 999;
  white-space: pre-line;
`;

const TooltipContent: React.FC<{content: any}> = (props) => {
  return (<TooltipDiv tabIndex={999}>
    {props.content}
  </TooltipDiv>);
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
