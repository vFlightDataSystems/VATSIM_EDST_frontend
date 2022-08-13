/* eslint-disable no-console */
import { useHub } from "./useHub";
import { ApiLocation } from "../types/apiTypes/apiLocation";
import { HoldAnnotations } from "../enums/hold/holdAnnotations";
import { useRootDispatch } from "../redux/hooks";
import { setMcaAcceptMessage } from "../redux/slices/appSlice";
import { CreateOrAmendFlightplanDto } from "../types/apiTypes/CreateOrAmendFlightplanDto";
import { AircraftId } from "../types/aircraftId";

export const useHubActions = () => {
  const dispatch = useRootDispatch();
  const hubConnection = useHub();

  const generateFrd = (location: ApiLocation) =>
    hubConnection?.invoke<string>("generateFrd", location).catch(error => {
      console.log(error);
      return null;
    }) ?? null;

  const amendFlightplan = async (fp: CreateOrAmendFlightplanDto) => {
    hubConnection?.invoke<void>("amendFlightPlan", fp).catch(e => {
      console.log("error amending flightplan:", e);
    });
  };

  const setHoldAnnotations = async (aircraftId: AircraftId, annotations: HoldAnnotations) => {
    hubConnection?.invoke("activateFlightplan", aircraftId).then(console.log);
    return hubConnection
      ?.invoke<void>("setHoldAnnotations", aircraftId, annotations)
      .then(() => dispatch(setMcaAcceptMessage(`HOLD\n${aircraftId}`)))
      .catch(error => {
        console.log(error);
      });
  };

  const cancelHold = async (aircraftId: string) =>
    hubConnection?.invoke<void>("deleteHoldAnnotations", aircraftId).catch(error => {
      console.log(error);
    });

  const sendUplinkMessage = async (aircraftId: AircraftId, message: string) =>
    hubConnection?.invoke<void>("sendPrivateMessage", aircraftId, message).catch(error => {
      console.log(error);
    });

  return {
    generateFrd,
    amendFlightplan,
    setHoldAnnotations,
    cancelHold,
    sendUplinkMessage
  };
};
/* eslint-enable no-console */
