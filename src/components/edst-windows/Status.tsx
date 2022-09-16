import React, { useState } from "react";
import { useRootSelector } from "../../redux/hooks";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useSocketConnector } from "../../hooks/useSocketConnector";
import { useHubConnection } from "../../hooks/useHubConnection";
import { EdstButton } from "../utils/EdstButton";
import { artccIdSelector, sectorIdSelector } from "../../redux/slices/sectorSlice";
import { FloatingWindow } from "../utils/FloatingWindow";

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
    <FloatingWindow
      title="STATUS"
      optionsHeaderTitle="STATUS"
      minWidth="360px"
      window={EdstWindow.STATUS}
      showOptions={showOptions}
      setShowOptions={setShowOptions}
    >
      <div>
        Submit Feedback{" "}
        <a href="https://forms.gle/LpzgyNMNMwa8CY8e8" target="_blank" rel="noreferrer">
          here
        </a>
      </div>
      <div>
        <a href="https://github.com/vFlightDataSystems/VATSIM_EDST_frontend/wiki" target="_blank" rel="noreferrer">
          Roadmap
        </a>
      </div>
      <EdstButton onMouseDown={onClickToggleSocket}>{isConnected ? "Disable" : "Enable"} Shared State</EdstButton>
    </FloatingWindow>
  );
};
