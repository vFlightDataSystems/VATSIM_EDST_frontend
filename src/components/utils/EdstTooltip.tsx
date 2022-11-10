import React, { forwardRef, useEffect, useRef } from "react";
import type { CSSProperties } from "styled-components";
import styled from "styled-components";
import { useRootSelector } from "~redux/hooks";
import { tooltipsEnabledSelector } from "~redux/slices/appSlice";

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

export const EdstTooltip = forwardRef<HTMLDivElement, EdstTooltipProps>(({ title, content, ...props }, ref) => {
  const localRef = useRef<HTMLDivElement | null>(null);
  const globalTooltipsEnabled = useRootSelector(tooltipsEnabledSelector);
  const [tooltipEnabled, setTooltipEnabled] = React.useState(false);

  useEffect(() => {
    if (title && localRef.current) {
      const element = localRef.current;
      const onMouseEnter = (e: MouseEvent) => e.shiftKey && setTooltipEnabled(true);
      const onMouseLeave = () => setTooltipEnabled(false);
      localRef.current.addEventListener("mouseenter", onMouseEnter);
      localRef.current.addEventListener("mouseleave", onMouseLeave);

      return () => {
        if (element) {
          element.removeEventListener("mouseenter", onMouseEnter);
          element.removeEventListener("mouseleave", onMouseLeave);
        }
      };
    }
    return void 0;
  }, [title]);

  return (
    <TooltipBody
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      {...props}
    >
      {globalTooltipsEnabled && tooltipEnabled && title && <TooltipContent title={title} />}
      {content ?? props.children}
    </TooltipBody>
  );
});
