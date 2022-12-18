import type { ComponentType } from "react";
import React, { useRef } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { useFocused } from "hooks/useFocused";
import { pushZStack, windowDimensionSelector, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import type { EdstWindow } from "types/edstWindow";
import { useDragging } from "hooks/useDragging";
import { useFullscreen } from "hooks/useFullscreen";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import floatingStyles from "css/floatingWindow.module.scss";
import clsx from "clsx";

export type HeaderComponentProps = {
  focused: boolean;
  toggleFullscreen: () => void;
  startDrag: React.MouseEventHandler<HTMLDivElement>;
};

type FullscreenWindowProps = {
  edstWindow: EdstWindow;
  HeaderComponent: ComponentType<HeaderComponentProps>;
  BodyComponent: ComponentType<unknown>;
};

export const FullscreenWindow = React.memo(({ edstWindow, HeaderComponent, BodyComponent }: FullscreenWindowProps) => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const zStack = useRootSelector(zStackSelector);
  const pos = useRootSelector((state) => windowPositionSelector(state, edstWindow));
  const dim = useRootSelector((state) => windowDimensionSelector(state, edstWindow));
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, edstWindow, "mouseup");
  const { isFullscreen, toggleFullscreen } = useFullscreen(ref, edstWindow);

  const onMouseDownHandler = () => zStack.indexOf(edstWindow) < zStack.length - 1 && !isFullscreen && dispatch(pushZStack(edstWindow));
  const position = isFullscreen ? {} : pos;
  const dimension = isFullscreen ? { width: "calc(100% - 7px", height: "calc(100% - 9px)" } : dim;

  return (
    <div
      ref={ref}
      className={clsx(floatingStyles.resizable, { [floatingStyles.isFullscreen]: isFullscreen, noPointerEvents: anyDragging })}
      style={{ ...dimension, ...position, zIndex: 10000 + zStack.indexOf(edstWindow) }}
      onMouseDownCapture={onMouseDownHandler}
    >
      {!isFullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <HeaderComponent focused={focused} toggleFullscreen={toggleFullscreen} startDrag={(e) => !isFullscreen && startDrag(e)} />
      <BodyComponent />
    </div>
  );
});
