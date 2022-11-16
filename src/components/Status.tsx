import React, { useState } from "react";
import { useRootSelector } from "~redux/hooks";
import { useSocketConnector } from "hooks/useSocketConnector";
import { useHubConnection } from "hooks/useHubConnection";
import { artccIdSelector, sectorIdSelector } from "~redux/slices/sectorSlice";
import { EdstButton } from "components/utils/EdstButton";
import { FloatingWindow } from "components/utils/FloatingWindow";

export const Status = () => {
  const [showOptions, setShowOptions] = useState(false);

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
    <FloatingWindow title="STATUS" optionsHeaderTitle="STATUS" width="40ch" window="STATUS" showOptions={showOptions} setShowOptions={setShowOptions}>
      <EdstButton onMouseDown={onClickToggleSocket} content={`${isConnected ? "Disable" : "Enable"} Shared State`} />
      <span>
        Submit Feedback{" "}
        <a href="https://forms.gle/LpzgyNMNMwa8CY8e8" target="_blank" rel="noreferrer">
          here
        </a>{" "}
        or on the Discord server.
      </span>
    </FloatingWindow>
  );
};
