import React, { useEffect, useRef } from "react";

import styled from "styled-components";
import { useResizeDetector } from "react-resize-detector";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { pushZStack, setWindowDimension, windowDimensionSelector, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { useFocused } from "hooks/useFocused";
import { useDragging } from "hooks/useDragging";
import { ResizableFloatingWindowDiv } from "styles/floatingWindowStyles";
import { useFullscreen } from "hooks/useFullscreen";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { GpdBody } from "components/GpdBody";
import { GpdHeader } from "components/GpdHeader";

const GpdDiv = styled(ResizableFloatingWindowDiv)``;

export const Gpd = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const pos = useRootSelector((state) => windowPositionSelector(state, "GPD"));
  const dimension = useRootSelector((state) => windowDimensionSelector(state, "GPD"));
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "GPD", "mouseup");
  const { isFullscreen, toggleFullscreen } = useFullscreen(ref, "GPD");
  const { width, height } = useResizeDetector({ targetRef: ref });

  useEffect(() => {
    if (!isFullscreen && width && height) {
      dispatch(
        setWindowDimension({
          window: "GPD",
          dim: {
            width: `${width}px`,
            height: `${height}px`,
          },
        })
      );
    }
  }, [dispatch, isFullscreen, height, width]);

  const onMouseDownHandler = () => zStack.indexOf("GPD") < zStack.length - 1 && !isFullscreen && dispatch(pushZStack("GPD"));

  return (
    <GpdDiv
      ref={ref}
      pos={pos}
      dimension={dimension}
      anyDragging={anyDragging}
      fullscreen={isFullscreen}
      zIndex={zStack.indexOf("GPD")}
      onMouseDown={onMouseDownHandler}
    >
      {!isFullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <GpdHeader focused={focused} toggleFullscreen={toggleFullscreen} startDrag={(e) => !isFullscreen && startDrag(e)} />
      <GpdBody />
    </GpdDiv>
  );
};
