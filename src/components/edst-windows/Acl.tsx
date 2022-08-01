import React, { useRef } from "react";
import styled from "styled-components";
import { AclHeader } from "./acl-components/AclHeader";
import { AclTable } from "./acl-components/AclTable";
import { useRootSelector, useRootDispatch } from "../../redux/hooks";
import { zStackSelector, pushZStack, windowPositionSelector } from "../../redux/slices/appSlice";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "../../styles/colors";
import { EdstWindow } from "../../namespaces";
import { useFocused } from "../../hooks/useFocused";
import { useDragging } from "../../hooks/useDragging";
import { ResizableFloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { useFullscreen } from "../../hooks/useFullscreen";

const AclDiv = styled(ResizableFloatingWindowDiv)`
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

export const Acl = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.ACL));
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.ACL);
  const { fullscreen, toggleFullscreen } = useFullscreen(ref);

  const onMouseDownHandler = () => {
    if (zStack.indexOf(EdstWindow.ACL) < zStack.length - 1 && !fullscreen) {
      dispatch(pushZStack(EdstWindow.ACL));
    }
  };

  return (
    <AclDiv
      ref={ref}
      pos={pos}
      anyDragging={anyDragging}
      fullscreen={fullscreen}
      zIndex={zStack.indexOf(EdstWindow.ACL)}
      onMouseDown={onMouseDownHandler}
    >
      {!fullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
      <AclHeader focused={focused} toggleFullscreen={toggleFullscreen} startDrag={e => !fullscreen && startDrag(e)} />
      <AclTable />
    </AclDiv>
  );
};
