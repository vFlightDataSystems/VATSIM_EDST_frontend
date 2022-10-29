import { useContext } from "react";
import { SocketContext } from "~/contexts/SocketContext";

export const useSocketConnector = () => {
  const { connectSocket, disconnectSocket, isConnected } = useContext(SocketContext);
  return { connectSocket, disconnectSocket, isConnected };
};
