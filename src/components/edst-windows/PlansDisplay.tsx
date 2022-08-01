import React, { useRef } from "react";

import styled from "styled-components";
import { PlansDisplayHeader } from "./plans-display-components/PlansDisplayHeader";
import { PlansDisplayTable } from "./plans-display-components/PlansDisplayTable";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { zStackSelector, pushZStack, windowPositionSelector } from "../../redux/slices/appSlice";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "../../styles/colors";
import { useFocused } from "../../hooks/useFocused";
import { useDragging } from "../../hooks/useDragging";
import { ResizableFloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { useFullscreen } from "../../hooks/useFullscreen";
import { EdstWindow } from "../../enums/edstWindow";

const PlansDisplayDiv = styled(ResizableFloatingWindowDiv)`
  display: block;
  white-space: nowrap;
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

export const PlansDisplay = () => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const zStack = useRootSelector(zStackSelector);
  const pos = useRootSelector(windowPositionSelector(EdstWindow.PLANS_DISPLAY));
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.PLANS_DISPLAY);
  const { fullscreen, toggleFullscreen } = useFullscreen(ref);

  const onMouseDownHandler = () =>
    zStack.indexOf(EdstWindow.PLANS_DISPLAY) < zStack.length - 1 && !fullscreen && dispatch(pushZStack(EdstWindow.PLANS_DISPLAY));

  return (
    <PlansDisplayDiv ref={ref} pos={pos} anyDragging={anyDragging} zIndex={zStack.indexOf(EdstWindow.PLANS_DISPLAY)} onMouseDown={onMouseDownHandler}>
      {!fullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
      <PlansDisplayHeader focused={focused} toggleFullscreen={toggleFullscreen} startDrag={e => !fullscreen && startDrag(e)} />
      <PlansDisplayTable />
    </PlansDisplayDiv>
  );
};
