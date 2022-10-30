import _ from "lodash";
import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";
import type { EdstEntry } from "types/edstEntry";
import { LocalVEdstEntry } from "types/localVEdstEntry";
import type { RootThunkAction } from "~redux/store";
import { setEntry, updateEntry } from "~redux/slices/entrySlice";
import sharedSocket from "~socket";

function createEntryFromFlightplan(fp: ApiFlightplan): EdstEntry {
  return _.assign(
    {
      ...fp,
      ...new LocalVEdstEntry(),
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
