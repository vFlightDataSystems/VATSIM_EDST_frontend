import type { CSSProperties } from "react";
import React, { forwardRef, useEffect, useRef } from "react";
import { useRootSelector } from "~redux/hooks";
import { tooltipsEnabledSelector } from "~redux/slices/appSlice";
import type { AtMostOne } from "types/utility-types";
import tooltipStyles from "css/tooltip.module.scss";
import clsx from "clsx";

const TooltipContent = ({ title }: { title: string }) => {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex,jsx-a11y/tabindex-no-positive
    <div className={tooltipStyles.tooltip} tabIndex={30000}>
      {title}
    </div>
  );
};

type EdstTooltipProps = {
  title?: string;
  style?: CSSProperties;
  disabled?: boolean;
  className?: string;
} & AtMostOne<{ content: string; children: React.ReactNode }> &
  React.HTMLAttributes<HTMLDivElement>;

export const EdstTooltip = forwardRef<HTMLDivElement, EdstTooltipProps>(({ className, title, content, ...props }, ref) => {
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
    <div
      className={clsx(tooltipStyles.tooltipContainer, className)}
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
    </div>
  );
});
