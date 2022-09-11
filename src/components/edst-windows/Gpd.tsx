import React, { useRef, useState } from "react";

import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { GpdHeader } from "./gpd-components/GpdHeader";
import { GpdBody } from "./gpd-components/GpdBody";
import { useFocused } from "../../hooks/useFocused";
import { useDragging } from "../../hooks/useDragging";
import { ResizableFloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { useFullscreen } from "../../hooks/useFullscreen";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";

const GpdDiv = styled(ResizableFloatingWindowDiv)``;

export const Gpd = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [zoomLevel, setZoomLevel] = useState(6);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.GPD));
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.GPD, "mouseup");
  const { isFullscreen, toggleFullscreen } = useFullscreen(ref, EdstWindow.GPD);

  const onMouseDownHandler = () => zStack.indexOf(EdstWindow.GPD) < zStack.length - 1 && !isFullscreen && dispatch(pushZStack(EdstWindow.GPD));

  return (
    <GpdDiv
      ref={ref}
      pos={pos}
      anyDragging={anyDragging}
      fullscreen={isFullscreen}
      zIndex={zStack.indexOf(EdstWindow.GPD)}
      onMouseDown={onMouseDownHandler}
    >
      {!isFullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <GpdHeader
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={e => !isFullscreen && startDrag(e)}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />
      <GpdBody zoomLevel={zoomLevel} />
    </GpdDiv>
  );
};
