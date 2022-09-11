import React, { useRef } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { FloatingWindowBodyDiv, FloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { FloatingWindowHeader } from "../utils/FloatingWindowHeader";

const OutageDiv = styled(FloatingWindowDiv)`
  width: 340px;
`;

export const Outage = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.OUTAGE));
  const ref = useRef(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.OUTAGE, "mousedown");
  const zStack = useRootSelector(zStackSelector);

  return (
    pos && (
      <OutageDiv
        pos={pos}
        ref={ref}
        zIndex={zStack.indexOf(EdstWindow.OUTAGE)}
        onMouseDown={() => zStack.indexOf(EdstWindow.OUTAGE) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.OUTAGE))}
        anyDragging={anyDragging}
        id="edst-outage"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <FloatingWindowHeader title="OUTAGE" onClose={() => dispatch(closeWindow(EdstWindow.OUTAGE))} startDrag={startDrag} />
        <FloatingWindowBodyDiv>OUTAGE TEST</FloatingWindowBodyDiv>
      </OutageDiv>
    )
  );
};
