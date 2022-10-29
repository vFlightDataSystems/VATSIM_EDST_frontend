import type { ApiLocation } from "types/apiTypes/apiLocation";
import type { HoldAnnotations } from "enums/hold/holdAnnotations";
import { useRootDispatch } from "~redux/hooks";
import { setMcaAcceptMessage } from "~redux/slices/appSlice";
import type { CreateOrAmendFlightplanDto } from "types/apiTypes/CreateOrAmendFlightplanDto";
import type { AircraftId } from "types/aircraftId";
import { useHubConnection } from "./useHubConnection";

export const useHubActions = () => {
  const dispatch = useRootDispatch();
  const hubConnection = useHubConnection();

  const activateFlightplan = (aircraftId: AircraftId) => {
    hubConnection?.invoke("activateFlightplan", aircraftId).then(console.log);
  };

  const generateFrd = async (location: ApiLocation) =>
    hubConnection?.invoke<string>("generateFrd", location).catch((error) => {
      console.log(error);
      return null;
    }) ?? null;

  const amendFlightplan = async (fp: CreateOrAmendFlightplanDto) => {
    hubConnection?.invoke<void>("amendFlightPlan", fp).catch((e) => {
      console.log("error amending flightplan:", e);
    });
  };

  const setHoldAnnotations = async (aircraftId: AircraftId, annotations: HoldAnnotations) => {
    activateFlightplan(aircraftId);
    return hubConnection
      ?.invoke<void>("setHoldAnnotations", aircraftId, annotations)
      .then(() => dispatch(setMcaAcceptMessage(`HOLD\n${aircraftId}`)))
      .catch((error) => {
        console.log(error);
      });
  };

  const cancelHold = async (aircraftId: string) =>
    hubConnection?.invoke<void>("deleteHoldAnnotations", aircraftId).catch((error) => {
      console.log(error);
    });

  const sendUplinkMessage = async (aircraftId: AircraftId, message: string) =>
    hubConnection?.invoke<void>("sendPrivateMessage", aircraftId, message).catch((error) => {
      console.log(error);
    });

  return {
    activateFlightplan,
    generateFrd,
    amendFlightplan,
    setHoldAnnotations,
    cancelHold,
    sendUplinkMessage,
  };
};
