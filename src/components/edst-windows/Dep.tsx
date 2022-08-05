import React, { useRef } from "react";
import styled from "styled-components";
import { DepHeader } from "./dep-components/DepHeader";
import { DepTable } from "./dep-components/DepTable";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "../../styles/colors";
import { useFocused } from "../../hooks/useFocused";
import { useDragging } from "../../hooks/useDragging";
import { ResizableFloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { useFullscreen } from "../../hooks/useFullscreen";
import { EdstWindow } from "../../enums/edstWindow";

const DepDiv = styled(ResizableFloatingWindowDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid ${edstWindowBorderColor};
  outline: 1px solid ${edstWindowOutlineColor};
  color: ${edstFontGrey};
  background-color: #000000;
  min-width: 600px;
  min-height: 200px;
`;

export const Dep = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.DEP));
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.DEP);
  const { isFullscreen, toggleFullscreen } = useFullscreen(ref, EdstWindow.DEP);

  const onMouseDownHandler = () => zStack.indexOf(EdstWindow.DEP) < zStack.length - 1 && !isFullscreen && dispatch(pushZStack(EdstWindow.DEP));

  return (
    <DepDiv
      anyDragging={anyDragging}
      ref={ref}
      pos={pos}
      fullscreen={isFullscreen}
      zIndex={zStack.indexOf(EdstWindow.DEP)}
      onMouseDown={onMouseDownHandler}
    >
      {!isFullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
      <DepHeader focused={focused} toggleFullscreen={toggleFullscreen} startDrag={e => !isFullscreen && startDrag(e)} />
      <DepTable />
    </DepDiv>
  );
};
