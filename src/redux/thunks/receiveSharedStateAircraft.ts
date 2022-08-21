import { RootThunkAction } from "../store";
import { SharedStateAircraftDto } from "../../types/sharedStateTypes/sharedStateAircraftDto";
import { updateEntry } from "../slices/entrySlice";

export function receiveSharedStateAircraft(aircraft: SharedStateAircraftDto): RootThunkAction {
  return (dispatch, getState) => {
    const { entries } = getState();
    if (Object.keys(entries).includes(aircraft.aircraftId)) {
      dispatch(updateEntry({ aircraftId: aircraft.aircraftId, data: aircraft }));
    }
  };
}
