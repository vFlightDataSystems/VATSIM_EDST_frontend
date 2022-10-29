import type { ApiAircraftTrack } from "types/apiTypes/apiAircraftTrack";
import type { EdstEntry } from "types/edstEntry";
import type { RootThunkAction } from "../store";
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
