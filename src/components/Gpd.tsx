import React, { useRef } from "react";

import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { pushZStack, windowDimensionSelector, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { useFocused } from "hooks/useFocused";
import { useDragging } from "hooks/useDragging";
import { useFullscreen } from "hooks/useFullscreen";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { GpdBody } from "components/GpdBody";
import { GpdHeader } from "components/GpdHeader";
import clsx from "clsx";
import floatingStyles from "css/floatingWindow.module.scss";

export const ZOOM_SNAP = 500;

export const Gpd = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const pos = useRootSelector((state) => windowPositionSelector(state, "GPD"));
  const dim = useRootSelector((state) => windowDimensionSelector(state, "GPD"));
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "GPD", "mouseup");
  const { isFullscreen, toggleFullscreen } = useFullscreen(ref, "GPD");

  const onMouseDownHandler = () => zStack.indexOf("GPD") < zStack.length - 1 && !isFullscreen && dispatch(pushZStack("GPD"));

  const position = isFullscreen ? {} : pos;
  const dimension = isFullscreen ? { width: "calc(100% - 10px", height: "calc(100% - 10px)" } : dim;

  return (
    <div
      ref={ref}
      className={clsx(floatingStyles.resizable, { [floatingStyles.isFullscreen]: isFullscreen, noPointerEvents: anyDragging })}
      style={{ ...dimension, ...position, zIndex: 10000 + zStack.indexOf("GPD") }}
      onMouseDown={onMouseDownHandler}
    >
      {!isFullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <GpdHeader focused={focused} toggleFullscreen={toggleFullscreen} startDrag={(e) => !isFullscreen && startDrag(e)} />
      <GpdBody />
    </div>
  );
};
