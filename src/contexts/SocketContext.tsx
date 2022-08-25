import React, { createContext, ReactNode, useCallback, useState } from "react";
import { receiveSharedStateAircraft } from "../redux/thunks/sharedStateThunks/receiveSharedStateAircraft";
import { log } from "../console";
import { useRootDispatch } from "../redux/hooks";
import { receiveUiStateThunk } from "../redux/thunks/sharedStateThunks/receiveUiStateThunk";
import { receiveAclStateThunk } from "../redux/thunks/sharedStateThunks/receiveAclStateThunk";
import { receivePlansDisplayStateThunk } from "../redux/thunks/sharedStateThunks/receivePlansDisplayStateThunk";
import { receiveDepStateThunk } from "../redux/thunks/sharedStateThunks/receiveDepStateThunk";
import { receiveGpdStateThunk } from "../redux/thunks/sharedStateThunks/receiveGpdStateThunk";
import { pushZStack } from "../redux/slices/appSlice";
import sharedSocket from "../sharedState/socket";

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
        socket.on("receiveAircraft", aircraft => {
          dispatch(receiveSharedStateAircraft(aircraft));
        });
        socket.on("receiveUiState", state => {
          dispatch(receiveUiStateThunk(state));
        });
        socket.on("receiveAclState", state => {
          dispatch(receiveAclStateThunk(state));
        });
        socket.on("receiveDepState", state => {
          dispatch(receiveDepStateThunk(state));
        });
        socket.on("receiveGpdState", state => {
          dispatch(receiveGpdStateThunk(state));
        });
        socket.on("receivePlansDisplayState", state => {
          dispatch(receivePlansDisplayStateThunk(state));
        });
        socket.on("receiveBringWindowToFront", edstWindow => {
          dispatch(pushZStack(edstWindow));
        });
        socket.on("disconnect", reason => {
          setIsConnected(false);
          log(reason);
        });
      }
    },
    [dispatch]
  );

  const disconnectSocket = useCallback(() => {
    sharedSocket.disconnect();
  }, [dispatch]);

  return { connectSocket, disconnectSocket, isConnected };
};

export const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const contextValue = useSocketContextInit();

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};
