import type { ApiLocation } from "types/apiTypes/apiLocation";
import type { HoldAnnotations } from "types/hold/holdAnnotations";
import { useRootDispatch } from "~redux/hooks";
import { setMcaAcceptMessage } from "~redux/slices/appSlice";
import type { CreateOrAmendFlightplanDto } from "types/apiTypes/CreateOrAmendFlightplanDto";
import type { AircraftId } from "types/aircraftId";
import { useHubConnection } from "hooks/useHubConnection";
import { ProcessEramMessageDto } from "~/types/apiTypes/ProcessEramMessageDto";
import { HubConnectionState, HubConnection } from "@microsoft/signalr";
import { useHubConnector } from "./useHubConnector";
import { EramMessageProcessingResultDto } from "~/types/apiTypes/EramMessageProcessingResultDto";

// Refactored helper
async function ensureConnected(
  hubConnection: HubConnection | null,
  connectHub: () => Promise<void>
): Promise<HubConnection | null> {
  if (!hubConnection) {
    console.log("Hub connection is not available");
    return null;
  }

  if (hubConnection.state !== HubConnectionState.Connected) {
    console.log("Reconnecting hub connection...");
    await connectHub();
  }

  return hubConnection;
}

export const useHubActions = () => {
  const dispatch = useRootDispatch();
  const hubConnection = useHubConnection();
  const { connectHub } = useHubConnector();

  const activateFlightplan = async (aircraftId: AircraftId) => {
    const connection = await ensureConnected(hubConnection, connectHub);
    if (!connection) return;
    connection.invoke("activateFlightplan", aircraftId).then(console.log);
  };

  const generateFrd = async (location: ApiLocation) => {
    const connection = await ensureConnected(hubConnection, connectHub);
    if (!connection) return null;
    return connection.invoke<string>("generateFrd", location).catch((error) => {
      console.log(error);
      return null;
    });
  };

  const amendFlightplan = async (fp: CreateOrAmendFlightplanDto) => {
    const connection = await ensureConnected(hubConnection, connectHub);
    if (!connection) return;
    connection.invoke<void>("amendFlightPlan", fp).catch((e) => {
      console.log("error amending flightplan:", e);
    });
  };

  const setHoldAnnotations = async (aircraftId: AircraftId, annotations: HoldAnnotations) => {
    const connection = await ensureConnected(hubConnection, connectHub);
    if (!connection) return;
    await activateFlightplan(aircraftId);
    return connection
      .invoke<void>("setHoldAnnotations", aircraftId, annotations)
      .then(() => dispatch(setMcaAcceptMessage(`HOLD\n${aircraftId}`)))
      .catch((error) => {
        console.log(error);
      });
  };

  const cancelHold = async (aircraftId: AircraftId) => {
    const connection = await ensureConnected(hubConnection, connectHub);
    if (!connection) return;
    connection.invoke<void>("deleteHoldAnnotations", aircraftId).catch((error) => {
      console.log(error);
    });
  };

  const sendUplinkMessage = async (aircraftId: AircraftId, message: string) => {
    const connection = await ensureConnected(hubConnection, connectHub);
    if (!connection) return;
    connection.invoke<void>("sendPrivateMessage", aircraftId, message).catch((error) => {
      console.log(error);
    });
  };

  const sendEramMessage = async (eramMessage: ProcessEramMessageDto) => {
    const connection = await ensureConnected(hubConnection, connectHub);
    if (!connection) return;
    try {
      const result = await connection.invoke<EramMessageProcessingResultDto>("processEramMessage", eramMessage);
      return result;
    } catch (error) {
      console.log("Error sending ERAM message:", error);
    }
  };

  return {
    activateFlightplan,
    generateFrd,
    amendFlightplan,
    setHoldAnnotations,
    cancelHold,
    sendUplinkMessage,
    sendEramMessage,
  };
};
