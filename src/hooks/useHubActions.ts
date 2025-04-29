import type { ApiLocation } from "types/apiTypes/apiLocation";
import type { HoldAnnotations } from "types/hold/holdAnnotations";
import { useRootDispatch } from "~redux/hooks";
import { setMcaAcceptMessage } from "~redux/slices/appSlice";
import type { CreateOrAmendFlightplanDto } from "types/apiTypes/CreateOrAmendFlightplanDto";
import type { AircraftId } from "types/aircraftId";
import { useHubConnection } from "hooks/useHubConnection";

function checkSessionActive(){
  const currentSessionActiveValue = sessionStorage.getItem('session-active');
  if (!currentSessionActiveValue) {
    console.log("Session storage does not contain a value for 'session-active'");
    return false;
  }

  if (currentSessionActiveValue === "true") {
    return true;
  } else {
    return false;
  }
}

export const useHubActions = () => {
  const dispatch = useRootDispatch();
  const hubConnection = useHubConnection();

  const activateFlightplan = (aircraftId: AircraftId) => {
    if (!checkSessionActive()) {
      return
    }
    hubConnection?.invoke("activateFlightplan", aircraftId).then(console.log);
  };

  const generateFrd = async (location: ApiLocation) => {

    if (!checkSessionActive()) {
      return null
    }

    hubConnection?.invoke<string>("generateFrd", location).catch((error) => {
      console.log(error);
      return null;
    }) ?? null; }

  const amendFlightplan = async (fp: CreateOrAmendFlightplanDto) => {

    if (!checkSessionActive()) {
      return
    }

    hubConnection?.invoke<void>("amendFlightPlan", fp).catch((e) => {
      console.log("error amending flightplan:", e);
    });
  };

  const setHoldAnnotations = async (aircraftId: AircraftId, annotations: HoldAnnotations) => {

    if (!checkSessionActive()) {
      return
    }

    activateFlightplan(aircraftId);
    return hubConnection
      ?.invoke<void>("setHoldAnnotations", aircraftId, annotations)
      .then(() => dispatch(setMcaAcceptMessage(`HOLD\n${aircraftId}`)))
      .catch((error) => {
        console.log(error);
      });
  };

  const cancelHold = async (aircraftId: AircraftId) => {

    if (!checkSessionActive()) {
      return
    }

    hubConnection?.invoke<void>("deleteHoldAnnotations", aircraftId).catch((error) => {
      console.log(error);
    })};

  const sendUplinkMessage = async (aircraftId: AircraftId, message: string) => {

    if (!checkSessionActive()) {
      return
    }

    hubConnection?.invoke<void>("sendPrivateMessage", aircraftId, message).catch((error) => {
      console.log(error);
    })};

  return {
    activateFlightplan,
    generateFrd,
    amendFlightplan,
    setHoldAnnotations,
    cancelHold,
    sendUplinkMessage,
  };
};
