import { useContext } from "react";
import { HubContext } from "~/contexts/HubContext";

export const useHubConnector = () => {
  const context = useContext(HubContext);
  return {
    connectHub: context.connectHub,
    disconnectHub: context.disconnectHub,
  };
};
