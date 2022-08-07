import React, { PropsWithChildren } from "react";
import styled from "styled-components";
import { useRootSelector } from "../../redux/hooks";
import { tooltipsEnabledSelector } from "../../redux/slices/appSlice";

const TooltipDiv = styled.div`
  width: auto;
  height: auto;
  position: absolute;
  color: #ffffff;
  background-color: #000000;
  border: 1px solid #adad00;
  padding: 2px;
  font-size: 0.85em;
  transform: translateY(32px);
  z-index: 2000;
  white-space: pre-line;
`;

const TooltipContent = ({ content }: { content: string }) => {
  // eslint-disable-next-line jsx-a11y/tabindex-no-positive
  return <TooltipDiv tabIndex={30000}>{content}</TooltipDiv>;
};

const TooltipBody = styled.div`
  all: unset;
  font-size: inherit;
`;

type EdstTooltipProps = {
  title?: string;
  content?: string;
  onMouseDown?: React.EventHandler<React.MouseEvent>;
  onContextMenu?: React.EventHandler<React.MouseEvent>;
  disabled?: boolean;
  style?: React.CSSProperties;
};

export const EdstTooltip = ({ title, content, style, ...props }: PropsWithChildren<EdstTooltipProps>) => {
  const globalTooltipsEnabled = useRootSelector(tooltipsEnabledSelector);
  const [tooltipEnabled, setTooltipEnabled] = React.useState(false);

  return (
    <TooltipBody
      style={style}
      {...props}
      onMouseEnter={e => e.shiftKey && setTooltipEnabled(true)}
      // onKeyDownCapture={(e) => e.shiftKey && setTooltipEnabled(!tooltip_enabled)}
      onMouseLeave={() => setTooltipEnabled(false)}
    >
      {globalTooltipsEnabled && tooltipEnabled && title && <TooltipContent content={title} />}
      {content ?? props.children}
    </TooltipBody>
  );
};
