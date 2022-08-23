import _ from "lodash";
import { ApiFlightplan } from "../../types/apiTypes/apiFlightplan";
import { RootState, RootThunkAction } from "../store";
import { setEntry, updateEntry } from "../slices/entrySlice";
import { EdstEntry } from "../../types/edstEntry";
import { sharedState } from "../../sharedState/socket";
import { LocalVEdstEntry } from "../../types/localVEdstEntry";

function createEntryFromFlightplan(fp: ApiFlightplan): EdstEntry {
  return _.assign(
    {
      ...fp,
      ...new LocalVEdstEntry()
    },
    sharedState[fp.aircraftId]
  );
}

export function updateFlightplanThunk(flightplan: ApiFlightplan): RootThunkAction {
  return (dispatch, getState) => {
    const { entries } = getState() as RootState;
    const aircraftIds = Object.keys(entries);
    if (aircraftIds.includes(flightplan.aircraftId)) {
      dispatch(updateEntry({ aircraftId: flightplan.aircraftId, data: flightplan }));
    } else {
      const entry = createEntryFromFlightplan(flightplan);
      if (entry !== null) {
        dispatch(setEntry(entry));
      }
    }
  };
}
