import _ from "lodash";
import { ApiFlightplan } from "../../types/apiTypes/apiFlightplan";
import { RootState, RootThunkAction } from "../store";
import { setEntry, updateEntry } from "../slices/entrySlice";
import { EdstEntry } from "../../types/edstEntry";
import { sharedState } from "../../sharedState/socket";

function createEntryFromFlightplan(fp: ApiFlightplan): EdstEntry {
  return _.assign(
    {
      ...fp,
      aclDeleted: false,
      aclDisplay: false,
      boundaryTime: 0,
      depDeleted: false,
      depDisplay: false,
      depStatus: -1,
      freeTextContent: "",
      holdAnnotations: null,
      spa: false,
      vciStatus: -1,
      aclRouteDisplay: null,
      assignedHeading: null,
      assignedSpeed: null,
      interimAltitude: null,
      aclHighlighted: false,
      depHighlighted: false,
      keep: false,
      pendingRemoval: null,
      previousRoute: null,
      remarksChecked: false,
      scratchpadHeading: null,
      scratchpadSpeed: null,
      showFreeText: false,
      cpdlcCapable: false,
      voiceType: ""
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
