import React, { useRef } from "react";

import styled from "styled-components";
import { PlansDisplayHeader } from "./plans-display-components/PlansDisplayHeader";
import { PlansDisplayTable } from "./plans-display-components/PlansDisplayTable";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { zStackSelector, pushZStack, windowPositionSelector } from "../../redux/slices/appSlice";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "../../styles/colors";
import { EdstWindow } from "../../namespaces";
import { useFocused } from "../../hooks/useFocused";
import { useDragging } from "../../hooks/useDragging";
import { ResizableFloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { useFullscreen } from "../../hooks/useFullscreen";

const PlansDisplayDiv = styled(ResizableFloatingWindowDiv)`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  min-height: 400px;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid ${edstWindowBorderColor};
  outline: 1px solid ${edstWindowOutlineColor};
  color: ${edstFontGrey};
  background-color: #000000;
`;

export const PlansDisplay: React.FC = () => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const zStack = useRootSelector(zStackSelector);
  const pos = useRootSelector(windowPositionSelector(EdstWindow.PLANS_DISPLAY));
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.PLANS_DISPLAY);
  const { fullscreen, toggleFullscreen } = useFullscreen(ref);

  return (
    <PlansDisplayDiv
      ref={ref}
      pos={pos}
      anyDragging={anyDragging}
      zIndex={zStack.indexOf(EdstWindow.PLANS_DISPLAY)}
      onMouseDown={() =>
        zStack.indexOf(EdstWindow.PLANS_DISPLAY) < zStack.length - 1 && !fullscreen && dispatch(pushZStack(EdstWindow.PLANS_DISPLAY))
      }
    >
      {!fullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
      <PlansDisplayHeader focused={focused} toggleFullscreen={toggleFullscreen} startDrag={startDrag} />
      <PlansDisplayTable />
    </PlansDisplayDiv>
  );
};
