import { RootThunkAction } from "../../store";
import { SharedAircraftDto } from "../../../typeDefinitions/types/sharedStateTypes/sharedAircraftDto";
import { updateEntry } from "../../slices/entrySlice";

export function receiveSharedStateAircraft(aircraft: SharedAircraftDto): RootThunkAction {
  return (dispatch, getState) => {
    const { entries } = getState();
    if (Object.keys(entries).includes(aircraft.aircraftId)) {
      dispatch(updateEntry({ aircraftId: aircraft.aircraftId, data: aircraft }));
    }
  };
}
