import React, { useState } from "react";
import { useRootSelector, useRootDispatch } from "~redux/hooks";
import { useSocketConnector } from "hooks/useSocketConnector";
import { useHubConnection } from "hooks/useHubConnection";
import { useHubConnector } from "hooks/useHubConnector";
import { artccIdSelector, sectorIdSelector } from "~redux/slices/sectorSlice";
import { EdstButton } from "components/utils/EdstButton";
import { FloatingWindow } from "components/utils/FloatingWindow";
import { HubConnectionState } from "@microsoft/signalr";
import { VERSION } from "~/utils/constants";
import { envSelector, hubConnectedSelector, logout, logoutThunk } from "~redux/slices/authSlice";
import { invertNumpadSelector, setInvertNumpad } from "~/redux/slices/appSlice";
import optionStyles from "css/optionMenu.module.scss";
import clsx from "clsx";

export const Status = () => {
  const [showOptions, setShowOptions] = useState(false);

  const artccId = useRootSelector(artccIdSelector);
  const sectorId = useRootSelector(sectorIdSelector);
  const environment = useRootSelector(envSelector);
  const hubConnection = useHubConnection();
  const { connectSocket, disconnectSocket, isConnected } = useSocketConnector();
  const dispatch = useRootDispatch();
  const { disconnectHub } = useHubConnector();
  const hubConnected = useRootSelector(hubConnectedSelector);
  const invertNumpad = useRootSelector(invertNumpadSelector);

  const toggleSocket = () => {
    if (isConnected) {
      disconnectSocket();
    } else if (hubConnection?.state === HubConnectionState.Connected && artccId && sectorId) {
      connectSocket(artccId, sectorId);
    }
  };

  const logOutHandler = () => {
    disconnectHub();
    dispatch(logoutThunk(false)); // false since we don't need page reload
  };

  // TODO: re-enable shared-state <EdstButton onMouseDown={toggleSocket} content={`${isConnected ? "Disable" : "Enable"} Shared State`} />

  return (
    <FloatingWindow title="STATUS" optionsHeaderTitle="STATUS" width="40ch" window="STATUS" showOptions={showOptions} setShowOptions={setShowOptions}>
      <div>vEDST version {VERSION}</div>
      <div>{hubConnected && environment ? `Connected to ${environment.name}` : "NOT CONNECTED"}</div>
      <div className={optionStyles.row}>
        <div className={clsx(optionStyles.col, "flex")} onMouseDown={() => dispatch(setInvertNumpad(!invertNumpad))}>
          <div className={clsx(optionStyles.indicator, { selected: invertNumpad })} />
          Invert Numpad
        </div>
      </div>
      <div>
        <EdstButton onMouseDown={logOutHandler} content="LOG OUT / CHANGE ENVIRONMENT" />
      </div>
    </FloatingWindow>
  );
};
