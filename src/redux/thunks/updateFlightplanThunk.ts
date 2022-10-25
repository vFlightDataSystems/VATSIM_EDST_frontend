import _ from "lodash";
import { ApiFlightplan } from "../../typeDefinitions/types/apiTypes/apiFlightplan";
import { RootThunkAction } from "../store";
import { setEntry, updateEntry } from "../slices/entrySlice";
import { EdstEntry } from "../../typeDefinitions/types/edstEntry";
import { LocalVEdstEntry } from "../../typeDefinitions/types/localVEdstEntry";
import sharedSocket from "../../sharedState/socket";

function createEntryFromFlightplan(fp: ApiFlightplan): EdstEntry {
  return _.assign(
    {
      ...fp,
      ...new LocalVEdstEntry()
    },
    sharedSocket.getSharedAircraftState()[fp.aircraftId]
  );
}

export function updateFlightplanThunk(flightplan: ApiFlightplan): RootThunkAction {
  return (dispatch, getState) => {
    const entries = getState().entries;
    const aircraftIds = Object.keys(entries);
    if (aircraftIds.includes(flightplan.aircraftId)) {
      dispatch(updateEntry({ aircraftId: flightplan.aircraftId, data: flightplan }));
    } else {
      const entry = createEntryFromFlightplan(flightplan);
      dispatch(setEntry(entry));
    }
  };
}
