import { useContext } from "react";
import { SocketContext } from "~/contexts/SocketContext";

export const useSocketConnector = () => {
  return useContext(SocketContext);
};
