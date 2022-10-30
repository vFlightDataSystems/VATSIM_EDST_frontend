import React, { useState } from "react";
import { useRootSelector } from "~redux/hooks";
import { EdstWindow } from "enums/edstWindow";
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
    <FloatingWindow
      title="STATUS"
      optionsHeaderTitle="STATUS"
      width="40ch"
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
      <EdstButton onMouseDown={onClickToggleSocket} content={`${isConnected ? "Disable" : "Enable"} Shared State`} />
    </FloatingWindow>
  );
};
