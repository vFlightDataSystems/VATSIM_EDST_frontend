import React, { useRef } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { closeWindow, windowPositionSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
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
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useSocketConnector } from "../../hooks/useSocketConnector";
import { useHubConnection } from "../../hooks/useHubConnection";
import { EdstButton } from "../utils/EdstButton";
import { artccIdSelector, sectorIdSelector } from "../../redux/slices/sectorSlice";

const StatusDiv = styled(FloatingWindowDiv)`
  width: 360px;
`;

const StatusBodyDiv = styled(FloatingWindowBodyDiv)`
  padding-top: 4px;
  padding-left: 20px;
`;

export const Status = () => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector(windowPositionSelector(EdstWindow.STATUS));
  const ref = useRef(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.STATUS, "mousedown");
  const zStack = useRootSelector(zStackSelector);

  const artccId = useRootSelector(artccIdSelector);
  const sectorId = useRootSelector(sectorIdSelector);
  const hubConnection = useHubConnection();
  const { connectSocket, disconnectSocket, isConnected } = useSocketConnector();

  const onClickToggleSocket = () => {
    if (isConnected) {
      disconnectSocket();
    } else if (hubConnection?.state === "Connected" && artccId && sectorId) {
      connectSocket(artccId, sectorId);
    }
  };

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
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <FloatingWindowHeaderDiv>
          <FloatingWindowHeaderColDiv20>M</FloatingWindowHeaderColDiv20>
          <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>STATUS</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv20 onMouseDown={() => dispatch(closeWindow(EdstWindow.STATUS))}>
            <FloatingWindowHeaderBlock8x2 />
          </FloatingWindowHeaderColDiv20>
        </FloatingWindowHeaderDiv>
        <StatusBodyDiv>
          {/* <EdstButton onMouseDown={() => dispatch(setShowSectorSelector(true))}>Change Sectors</EdstButton> */}
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
          <EdstButton onMouseDown={onClickToggleSocket}>{isConnected ? "Disable" : "Enable"} Shared State</EdstButton>
        </StatusBodyDiv>
      </StatusDiv>
    )
  );
};
