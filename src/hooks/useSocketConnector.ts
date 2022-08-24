import { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";

export const useSocketConnector = () => {
  const { connectSocket } = useContext(SocketContext);
  return { connectSocket };
};
