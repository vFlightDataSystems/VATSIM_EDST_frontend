import { ApiAircraftTrack } from "../../types/apiAircraftTrack";
import { RootThunkAction } from "../store";
import { EdstEntry } from "../../types/edstEntry";
import { setTrack } from "../slices/trackSlice";
import { getRemainingRouteFixes, getRouteFixesDistance } from "../../lib";
import { depFilter, aclFilter } from "../../filters";
import { addEntryToAcl, addEntryToDep, updateEntries } from "../slices/entrySlice";

export function updateAircraftTrackThunk(newAircraftTrack: ApiAircraftTrack): RootThunkAction {
  return (dispatch, getState) => {
    const updateTime = new Date().getTime();
    const { aircraftTracks, entries, sectorData } = getState();
    const { sectors, selectedSectorIds } = sectorData;
    const polygons = selectedSectorIds ? selectedSectorIds.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
    const oldTrack = aircraftTracks[newAircraftTrack.aircraftId];
    const updateData: Record<string, Partial<EdstEntry>> = {};
    if (!oldTrack || updateTime - oldTrack.lastUpdated > 4000) {
      const entry = entries[newAircraftTrack.aircraftId];
      dispatch(setTrack({ ...newAircraftTrack, lastUpdated: updateTime }));
      if (entry) {
        const pos = [newAircraftTrack.location.lon, newAircraftTrack.location.lat];
        const routeFixesDistance = getRouteFixesDistance(entry.routeFixes, pos);
        // const boundaryTime = computeBoundaryTime(entry, newAircraftTrack, polygons);
        updateData[entry.aircraftId] = getRemainingRouteFixes(entry.formattedRoute, routeFixesDistance, pos, entry.destination);
      }
      // console.log(newAircraftTrack, entry);
      // console.log(polygons, entry);
      if (polygons && entry && !entry.aclDisplay && aclFilter(entry, newAircraftTrack, polygons)) {
        dispatch(addEntryToAcl(newAircraftTrack.aircraftId));
      } else if (entry && !entry.depDisplay && depFilter(entry, newAircraftTrack, sectorData.artccId)) {
        dispatch(addEntryToDep(newAircraftTrack.aircraftId));
      }
    }
    dispatch(updateEntries(updateData));
  };
}
