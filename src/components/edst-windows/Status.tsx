import React, { useRef } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, setShowSectorSelector, windowPositionSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { EdstButton } from "../resources/EdstButton";
import {
  FloatingWindowBodyDiv,
  FloatingWindowDiv,
  FloatingWindowHeaderBlock8x2,
  FloatingWindowHeaderColDiv20,
  FloatingWindowHeaderColDivFlex,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { useDragging } from "../../hooks/utils";
import { EdstWindow } from "../../namespaces";

const StatusDiv = styled(FloatingWindowDiv)`
  width: 360px;
`;

const StatusBodyDiv = styled(FloatingWindowBodyDiv)`
  padding-top: 4px;
  padding-left: 20px;
`;

export const Status: React.FC = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.STATUS));
  const ref = useRef(null);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.STATUS);
  const zStack = useRootSelector(zStackSelector);

  return (
    pos && (
      <StatusDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.STATUS)}
        onMouseDown={() => zStack.indexOf(EdstWindow.STATUS) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.STATUS))}
        anyDragging={anyDragging}
        id="edst-status"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseDown={stopDrag} />}
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDiv20>M</FloatingWindowHeaderColDiv20>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>STATUS</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(EdstWindow.STATUS))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDiv20>
        </FloatingWindowHeaderDiv>
        <StatusBodyDiv>
          <EdstButton onMouseDown={() => dispatch(setShowSectorSelector(true))}>Change Sectors</EdstButton>
          <div>
            Submit Feedback{" "}
            <a href="https://forms.gle/LpzgyNMNMwa8CY8e8" target="_blank" rel="noreferrer">
              here
            </a>
          </div>
          <div>
            <a href="https://github.com/CaptainTux/VATSIM_EDST_frontend/wiki" target="_blank" rel="noreferrer">
              Roadmap
            </a>
          </div>
        </StatusBodyDiv>
      </StatusDiv>
    )
  );
};
