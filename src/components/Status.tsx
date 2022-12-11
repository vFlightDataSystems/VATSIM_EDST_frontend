import React, { useState } from "react";
import { useRootSelector } from "~redux/hooks";
import { useSocketConnector } from "hooks/useSocketConnector";
import { useHubConnection } from "hooks/useHubConnection";
import { artccIdSelector, sectorIdSelector } from "~redux/slices/sectorSlice";
import { EdstButton } from "components/utils/EdstButton";
import { FloatingWindow } from "components/utils/FloatingWindow";
import { HubConnectionState } from "@microsoft/signalr";
import { VERSION } from "~/utils/constants";

export const Status = () => {
  const [showOptions, setShowOptions] = useState(false);

  const artccId = useRootSelector(artccIdSelector);
  const sectorId = useRootSelector(sectorIdSelector);
  const hubConnection = useHubConnection();
  const { connectSocket, disconnectSocket, isConnected } = useSocketConnector();

  const toggleSocket = () => {
    if (isConnected) {
      disconnectSocket();
    } else if (hubConnection?.state === "Connected" && artccId && sectorId) {
      connectSocket(artccId, sectorId);
    }
  };

  return (
    <FloatingWindow title="STATUS" optionsHeaderTitle="STATUS" width="40ch" window="STATUS" showOptions={showOptions} setShowOptions={setShowOptions}>
      <p>vEDST version {VERSION}</p>
      <p>{hubConnection?.state === HubConnectionState.Connected ? `Connected to ${import.meta.env.VITE_VNAS_ENV_NAME}` : "NOT CONNECTED"}</p>
      <p>
        GPD powered by{" "}
        <a href="https://d3js.org" target="_blank" rel="noreferrer">
          D3
        </a>
      </p>
      <p>
        <EdstButton onMouseDown={toggleSocket} content={`${isConnected ? "Disable" : "Enable"} Shared State`} />
      </p>
    </FloatingWindow>
  );
};
