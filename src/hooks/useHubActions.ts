/* eslint-disable no-console */
import { useHub } from "./useHub";
import { ApiLocation } from "../types/apiTypes/apiLocation";
import { ApiFlightplan } from "../types/apiTypes/apiFlightplan";
import { HoldAnnotations } from "../enums/hold/holdAnnotations";

export const useHubActions = () => {
  const hubConnection = useHub();

  const generateFrd = (location: ApiLocation) =>
    hubConnection?.invoke<string>("generateFrd", location).catch(error => {
      console.log(error);
      return null;
    }) ?? null;

  const amendFlightplan = async (fp: ApiFlightplan) => {
    hubConnection?.invoke<void>("amendFlightPlan", fp).catch(e => {
      console.log("error amending flightplan:", e);
    });
  };

  const setHoldAnnotations = async (aircraftId: string, annotations: HoldAnnotations) => {
    hubConnection?.invoke("activateFlightplan", aircraftId).then(console.log);
    return hubConnection?.invoke<void>("setHoldAnnotations", aircraftId, annotations).catch(error => {
      console.log(error);
    });
  };

  const cancelHold = async (aircraftId: string) =>
    hubConnection?.invoke<void>("deleteHoldAnnotations", aircraftId).catch(error => {
      console.log(error);
    });

  return {
    generateFrd,
    amendFlightplan,
    setHoldAnnotations,
    cancelHold
  };
};
/* eslint-enable no-console */
