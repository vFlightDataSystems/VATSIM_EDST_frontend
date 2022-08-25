import { ApiAircraftTrack } from "../../typeDefinitions/types/apiTypes/apiAircraftTrack";
import { RootThunkAction } from "../store";
import { EdstEntry } from "../../typeDefinitions/types/edstEntry";
import { setTrack } from "../slices/trackSlice";
import { depFilter, aclFilter } from "../../filters";
import { addEntryToAcl, addEntryToDep, updateEntries } from "../slices/entrySlice";

export function updateAircraftTrackThunk(newAircraftTrack: ApiAircraftTrack): RootThunkAction {
  return (dispatch, getState) => {
    const updateTime = new Date().getTime();
    const { aircraftTracks, entries, sectorData } = getState();
    const { sectors, selectedSectorIds, artccId } = sectorData;
    const polygons = selectedSectorIds ? selectedSectorIds.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
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
      if (polygons && entry && !entry.aclDisplay) {
        aclFilter(entry, newAircraftTrack, polygons).then(result => {
          if (result) {
            dispatch(addEntryToAcl(newAircraftTrack.aircraftId));
          }
        });
      } else if (entry && !entry.depDisplay) {
        depFilter(entry, newAircraftTrack, artccId).then(result => {
          if (result) {
            dispatch(addEntryToDep(newAircraftTrack.aircraftId));
          }
        });
      }
    }
    dispatch(updateEntries(updateData));
  };
}
