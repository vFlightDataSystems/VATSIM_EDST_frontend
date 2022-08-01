import React, { useRef, useState } from "react";

import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { zStackSelector, pushZStack, windowPositionSelector } from "../../redux/slices/appSlice";
import { GpdHeader } from "./gpd-components/GpdHeader";
import { GpdBody } from "./gpd-components/GpdBody";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "../../styles/colors";
import { useFocused } from "../../hooks/useFocused";
import { useDragging } from "../../hooks/useDragging";
import { ResizableFloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { useFullscreen } from "../../hooks/useFullscreen";
import { EdstWindow } from "../../enums/edstWindow";

const GpdDiv = styled(ResizableFloatingWindowDiv)`
  white-space: nowrap;
  display: flex;
  flex-flow: column;
  overflow: hidden;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid ${edstWindowBorderColor};
  outline: 1px solid ${edstWindowOutlineColor};
  color: ${edstFontGrey};
  background-color: #000000;
  min-width: 600px;
  min-height: 200px;
`;

export const Gpd = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const [zoomLevel, setZoomLevel] = useState(6);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.GPD));
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.GPD);
  const { fullscreen, toggleFullscreen } = useFullscreen(ref);

  const onMouseDownHandler = () => zStack.indexOf(EdstWindow.GPD) < zStack.length - 1 && !fullscreen && dispatch(pushZStack(EdstWindow.GPD));

  return (
    <GpdDiv
      ref={ref}
      pos={pos}
      anyDragging={anyDragging}
      fullscreen={fullscreen}
      zIndex={zStack.indexOf(EdstWindow.GPD)}
      onMouseDown={onMouseDownHandler}
    >
      {!fullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
      <GpdHeader
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={e => !fullscreen && startDrag(e)}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />
      <GpdBody zoomLevel={zoomLevel} />
    </GpdDiv>
  );
};
