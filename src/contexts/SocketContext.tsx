import type { ReactNode } from "react";
import React, { createContext, useCallback, useState } from "react";
import { receiveSharedStateAircraft } from "~redux/thunks/sharedStateThunks/receiveSharedStateAircraft";
import { useRootDispatch } from "~redux/hooks";
import { receiveUiStateThunk } from "~redux/thunks/sharedStateThunks/receiveUiStateThunk";
import { addGIEntries, closeWindow, openWindow } from "~redux/slices/appSlice";
import { sharedStateAircraftSelect } from "~redux/thunks/aircraftSelect";
import { setAclState } from "~redux/slices/aclSlice";
import { setDepState } from "~redux/slices/depSlice";
import { setGpdState } from "~redux/slices/gpdSlice";
import { setPlanState } from "~redux/slices/planSlice";
import sharedSocket from "~socket";

class SocketContextValue {
  connectSocket: (artccId: string, sectorId: string) => void = sharedSocket.connect;

  disconnectSocket = sharedSocket.disconnect;

  isConnected = false;
}

export const SocketContext = createContext<SocketContextValue>(new SocketContextValue());

const useSocketContextInit = () => {
  const dispatch = useRootDispatch();

  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(
    (artccId: string, sectorId: string) => {
      const socket = sharedSocket.connect(artccId, sectorId);
      if (socket) {
        setIsConnected(true);
        socket.on("connect", () => {
          setIsConnected(true);
        });
        socket.on("disconnect", () => {
          setIsConnected(false);
        });
        socket.on("receiveAircraft", (aircraft) => {
          dispatch(receiveSharedStateAircraft(aircraft));
        });
        socket.on("receiveUiState", (state) => {
          dispatch(receiveUiStateThunk(state));
        });
        socket.on("receiveAclState", (state) => {
          dispatch(setAclState(state));
        });
        socket.on("receiveDepState", (state) => {
          dispatch(setDepState(state));
        });
        socket.on("receiveGpdState", (state) => {
          dispatch(setGpdState(state));
        });
        socket.on("receivePlansDisplayState", (state) => {
          dispatch(setPlanState(state));
        });
        socket.on("receiveOpenWindow", (edstWindow) => {
          dispatch(openWindow(edstWindow));
        });
        socket.on("receiveCloseWindow", (edstWindow) => {
          dispatch(closeWindow(edstWindow, false));
        });
        socket.on("receiveAircraftSelect", (asel, eventId) => {
          if (eventId === null) {
            dispatch(sharedStateAircraftSelect(asel));
          }
        });
        socket.on("receiveGIMessage", (sender, message) => {
          const date = new Date();
          const formattedMsg = `GI ${sender} ${
            date.getUTCHours().toString().padStart(2, "0") + date.getUTCMinutes().toString().padStart(2, "0")
          } ${message}`;
          dispatch(
            addGIEntries({
              [formattedMsg]: { text: formattedMsg, acknowledged: false },
            })
          );
        });
        socket.on("disconnect", (reason) => {
          setIsConnected(false);
          console.log(reason);
        });
      }
    },
    [dispatch]
  );

  const disconnectSocket = useCallback(() => {
    sharedSocket.disconnect();
    setIsConnected(false);
  }, []);

  return { connectSocket, disconnectSocket, isConnected };
};

export const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const contextValue = useSocketContextInit();

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};
