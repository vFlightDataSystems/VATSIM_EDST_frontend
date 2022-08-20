import { useContext } from "react";
import { HubContext } from "../contexts/HubContext";

export const useHubConnection = () => {
  return useContext(HubContext).hubConnection;
};
