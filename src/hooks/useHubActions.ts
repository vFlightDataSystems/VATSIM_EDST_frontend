import type { ApiLocation } from "types/apiTypes/apiLocation";
import type { HoldAnnotations } from "types/hold/holdAnnotations";
import { useRootDispatch } from "~redux/hooks";
import { setMcaAcceptMessage, setMcaRejectMessage, setMraMessage } from "~redux/slices/appSlice";
import type { CreateOrAmendFlightplanDto } from "types/apiTypes/CreateOrAmendFlightplanDto";
import type { AircraftId } from "types/aircraftId";
import { useHubConnection } from "hooks/useHubConnection";
import type { ProcessEramMessageDto } from "~/types/apiTypes/ProcessEramMessageDto";
import type { HubConnection } from "@microsoft/signalr";
import { HubConnectionState } from "@microsoft/signalr";
import type { EramMessageProcessingResultDto } from "~/types/apiTypes/EramMessageProcessingResultDto";
import { useHubConnector } from "./useHubConnector";
import { openWindowThunk } from "~/redux/thunks/openWindowThunk";

async function ensureConnected(hubConnection: HubConnection | null, connectHub: () => Promise<void>): Promise<HubConnection | null> {
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

type HubInvocation<T> = (connection: HubConnection) => Promise<T>;

const invokeHub = async <T>(
  hubConnection: HubConnection | null,
  connectHub: () => Promise<void>,
  invocation: HubInvocation<T>
): Promise<T | void> => {
  const connection = await ensureConnected(hubConnection, connectHub);
  if (!connection) return;

  try {
    return await invocation(connection);
  } catch (error) {
    console.log("Hub invocation error:", error);
  }
};

// Then modify your useHubActions hook to use this helper:
export const useHubActions = () => {
  const dispatch = useRootDispatch();
  const hubConnection = useHubConnection();
  const { connectHub } = useHubConnector();

  const generateFrd = async (location: ApiLocation) =>
    invokeHub(hubConnection, connectHub, (connection) => connection.invoke<string>("generateFrd", location));

  const amendFlightplan = async (fp: CreateOrAmendFlightplanDto) =>
    invokeHub(hubConnection, connectHub, (connection) => connection.invoke<void>("amendFlightPlan", fp));

  const setHoldAnnotations = async (aircraftId: AircraftId, annotations: HoldAnnotations) =>
    invokeHub(hubConnection, connectHub, async (connection) => {
      await connection.invoke<void>("setHoldAnnotations", aircraftId, annotations);
      dispatch(setMcaAcceptMessage(`HOLD\n${aircraftId}`));
    });

  const cancelHold = async (aircraftId: AircraftId) =>
    invokeHub(hubConnection, connectHub, (connection) => connection.invoke<void>("deleteHoldAnnotations", aircraftId));

  const sendUplinkMessage = async (aircraftId: AircraftId, message: string) =>
    invokeHub(hubConnection, connectHub, (connection) => connection.invoke<void>("sendPrivateMessage", aircraftId, message));

  const sendEramMessage = async (eramMessage: ProcessEramMessageDto) =>
    invokeHub<EramMessageProcessingResultDto>(hubConnection, connectHub, async (connection) => {
      const result = await connection.invoke<EramMessageProcessingResultDto>("processEramMessage", eramMessage);
      if (result) {
        if (result.isSuccess) {
          const feedbackMessage = result.feedback.length > 0 ? result.feedback.join("\n") : "Command accepted";
          dispatch(setMcaAcceptMessage(feedbackMessage));

          if (result.response) {
            dispatch(setMraMessage(result.response));
            dispatch(openWindowThunk("MESSAGE_RESPONSE_AREA"));
          }
        } else {
          const rejectMessage = result.feedback.length > 0 ? `REJECT\n${result.feedback.join("\n")}` : "REJECT\nCommand failed";
          dispatch(setMcaRejectMessage(rejectMessage));
        }
      }
      return result;
    });

  return {
    generateFrd,
    amendFlightplan,
    setHoldAnnotations,
    cancelHold,
    sendUplinkMessage,
    sendEramMessage,
  };
};