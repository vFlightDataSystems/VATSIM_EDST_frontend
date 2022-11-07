import React, { useRef } from "react";
import type { CSSProperties } from "styled-components";
import styled from "styled-components";
import { useRootSelector } from "~redux/hooks";
import { tooltipsEnabledSelector } from "~redux/slices/appSlice";
import { useEventListener } from "usehooks-ts";

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

const TooltipContent = ({ title }: { title: string }) => {
  // eslint-disable-next-line jsx-a11y/tabindex-no-positive
  return <TooltipDiv tabIndex={30000}>{title}</TooltipDiv>;
};

const TooltipBody = styled.div`
  all: unset;
  font-size: inherit;
`;

type EdstTooltipProps = {
  title?: string;
  content?: string;
  style?: CSSProperties;
  disabled?: boolean;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const EdstTooltip = ({ title, content, ...props }: EdstTooltipProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const globalTooltipsEnabled = useRootSelector(tooltipsEnabledSelector);
  const [tooltipEnabled, setTooltipEnabled] = React.useState(false);

  useEventListener("mouseenter", (e) => e.shiftKey && setTooltipEnabled(true), ref);
  useEventListener("mouseleave", () => setTooltipEnabled(false), ref);

  return (
    <TooltipBody ref={ref} {...props}>
      {globalTooltipsEnabled && tooltipEnabled && title && <TooltipContent title={title} />}
      {content ?? props.children}
    </TooltipBody>
  );
};
