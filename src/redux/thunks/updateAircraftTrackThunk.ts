import { ApiAircraftTrack } from "../../typeDefinitions/types/apiTypes/apiAircraftTrack";
import { RootThunkAction } from "../store";
import { EdstEntry } from "../../typeDefinitions/types/edstEntry";
import { setTrack } from "../slices/trackSlice";
import { updateEntries } from "../slices/entrySlice";

export function updateAircraftTrackThunk(newAircraftTrack: ApiAircraftTrack): RootThunkAction {
  return (dispatch, getState) => {
    const updateTime = new Date().getTime();
    const { aircraftTracks, entries } = getState();
    const oldTrack = aircraftTracks[newAircraftTrack.aircraftId];
    const updateData: Record<string, Partial<EdstEntry>> = {};
    if (!oldTrack || updateTime - oldTrack.lastUpdated > 4000) {
      const entry = entries[newAircraftTrack.aircraftId];
      dispatch(setTrack({ ...newAircraftTrack, lastUpdated: updateTime }));
      if (entry) {
        // const boundaryTime = computeBoundaryTime(entry, newAircraftTrack, polygons);
      }
      // console.log(newAircraftTrack, entry);
      // console.log(polygons, entry);
    }
    dispatch(updateEntries(updateData));
  };
}
