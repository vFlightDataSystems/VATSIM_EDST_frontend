import React, { useState } from "react";
import { useRootSelector } from "~redux/hooks";
import { useSocketConnector } from "hooks/useSocketConnector";
import { useHubConnection } from "hooks/useHubConnection";
import { artccIdSelector, sectorIdSelector } from "~redux/slices/sectorSlice";
import { EdstButton } from "components/utils/EdstButton";
import { FloatingWindow } from "components/utils/FloatingWindow";
import { HubConnectionState } from "@microsoft/signalr";
import { VERSION } from "~/utils/constants";
import { envSelector } from "~redux/slices/authSlice";

export const Status = () => {
  const [showOptions, setShowOptions] = useState(false);

  const artccId = useRootSelector(artccIdSelector);
  const sectorId = useRootSelector(sectorIdSelector);
  const environment = useRootSelector(envSelector);
  const hubConnection = useHubConnection();
  const { connectSocket, disconnectSocket, isConnected } = useSocketConnector();

  const toggleSocket = () => {
    if (isConnected) {
      disconnectSocket();
    } else if (hubConnection?.state === HubConnectionState.Connected && artccId && sectorId) {
      connectSocket(artccId, sectorId);
    }
  };

  return (
    <FloatingWindow title="STATUS" optionsHeaderTitle="STATUS" width="40ch" window="STATUS" showOptions={showOptions} setShowOptions={setShowOptions}>
      <div>vEDST version {VERSION}</div>
      <div>{hubConnection?.state === HubConnectionState.Connected && environment ? `Connected to ${environment.name}` : "NOT CONNECTED"}</div>
      <div>
        <EdstButton onMouseDown={toggleSocket} content={`${isConnected ? "Disable" : "Enable"} Shared State`} />
      </div>
    </FloatingWindow>
  );
};
