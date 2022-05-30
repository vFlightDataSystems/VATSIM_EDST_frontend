import React, { useRef } from "react";
import styled from "styled-components";
import { EdstWindow } from "../../enums";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { mraMsgSelector, windowPositionSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { FloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { useDragging } from "../../hooks";
import { EdstDraggingOutline } from "../../styles/draggingStyles";

const MessageResponseAreaDiv = styled(FloatingWindowDiv)`
  line-height: 1;
  padding: 0 2px;
  min-height: 80px;
  width: 340px;
  background-color: #000000;
  border: 1px solid #adadad;
  overflow-wrap: anywhere;
  white-space: pre-line;
  font-family: EDST, serif;
`;

export const MessageResponseArea: React.FC = () => {
  const pos = useRootSelector(windowPositionSelector(EdstWindow.messageResponseArea));
  const msg = useRootSelector(mraMsgSelector);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef(null);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.messageResponseArea);

  return (
    pos && (
      <MessageResponseAreaDiv
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.messageResponseArea)}
        ref={ref}
        anyDragging={anyDragging}
        id="edst-mra"
        onMouseDown={event => {
          startDrag(event);
          if (zStack.indexOf(EdstWindow.messageResponseArea) > 0) {
            dispatch(pushZStack(EdstWindow.messageResponseArea));
          }
        }}
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseDown={stopDrag} />}
        {msg}
      </MessageResponseAreaDiv>
    )
  );
};
