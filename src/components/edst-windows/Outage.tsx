import React, { useRef } from "react";
import styled from "styled-components";
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
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../enums/edstWindow";

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
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDiv20>M</FloatingWindowHeaderColDiv20>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>OUTAGE</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(EdstWindow.OUTAGE))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDiv20>
        </FloatingWindowHeaderDiv>
        <FloatingWindowBodyDiv>OUTAGE TEST</FloatingWindowBodyDiv>
      </OutageDiv>
    )
  );
};
