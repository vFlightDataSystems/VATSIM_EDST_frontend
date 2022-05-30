import React, { useRef } from "react";
import styled from "styled-components";
import { EdstWindow } from "../../enums";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock8x2,
  FloatingWindowHeaderColDiv20,
  FloatingWindowHeaderColDivFlex,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";
import { useDragging } from "../../hooks";
import { EdstDraggingOutline } from "../../styles/draggingStyles";

const OutageDiv = styled(FloatingWindowDiv)`
  width: 340px;
`;

export const Outage: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.outage));
  const ref = useRef(null);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.outage);
  const zStack = useRootSelector(zStackSelector);

  return (
    pos && (
      <OutageDiv
        pos={pos}
        ref={ref}
        zIndex={zStack.indexOf(EdstWindow.outage)}
        onMouseDown={() => zStack.indexOf(EdstWindow.outage) > 0 && dispatch(pushZStack(EdstWindow.outage))}
        anyDragging={anyDragging}
        id="edst-outage"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseDown={stopDrag} />}
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDiv20>M</FloatingWindowHeaderColDiv20>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>OUTAGE</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(EdstWindow.outage))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDiv20>
        </FloatingWindowHeaderDiv>
        <FloatingWindowBodyDiv>OUTAGE TEST</FloatingWindowBodyDiv>
      </OutageDiv>
    )
  );
};
