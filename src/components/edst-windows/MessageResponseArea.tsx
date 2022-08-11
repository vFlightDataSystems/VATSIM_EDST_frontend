import React, { useRef } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { mraMsgSelector, windowPositionSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { FloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../enums/edstWindow";
import { eramFontFamily } from "../../styles/styles";

const MessageResponseAreaDiv = styled(FloatingWindowDiv)`
  line-height: 1;
  padding: 0 2px;
  min-height: 80px;
  width: 340px;
  background-color: #000000;
  border: 1px solid #adadad;
  overflow-wrap: anywhere;
  white-space: pre-line;
  font-family: ${eramFontFamily};
`;

export const MessageResponseArea = () => {
  const pos = useRootSelector(windowPositionSelector(EdstWindow.MESSAGE_RESPONSE_AREA));
  const msg = useRootSelector(mraMsgSelector);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef(null);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.MESSAGE_RESPONSE_AREA);

  return (
    pos && (
      <MessageResponseAreaDiv
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.MESSAGE_RESPONSE_AREA)}
        ref={ref}
        anyDragging={anyDragging}
        id="edst-mra"
        onMouseDown={event => {
          startDrag(event);
          if (zStack.indexOf(EdstWindow.MESSAGE_RESPONSE_AREA) > 0) {
            dispatch(pushZStack(EdstWindow.MESSAGE_RESPONSE_AREA));
          }
        }}
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseDown={stopDrag} />}
        {msg}
      </MessageResponseAreaDiv>
    )
  );
};
