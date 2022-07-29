import { ApiAircraft } from "../../types/apiAircraft";
import { RootThunkAction } from "../store";
import { AircraftId } from "../../types/aircraftId";
import { AircraftTrack } from "../../types/aircraftTrack";
import { depFilter } from "../../filters";
import { addEntryToAcl, addEntryToDep } from "../slices/entrySlice";
import { setTracks } from "../slices/trackSlice";

export function updateSweatboxAircraftThunk(aircraftList: ApiAircraft[]): RootThunkAction {
  return (dispatch, getState) => {
    const { entries, sectorData } = getState();
    const newTracks: Record<AircraftId, AircraftTrack> = {};
    const aircraftMap = Object.fromEntries(aircraftList.map(aircraft => [aircraft.id, aircraft]));
    Object.entries(entries).forEach(([aircraftId, entry]) => {
      if (Object.keys(aircraftMap).includes(aircraftId)) {
        const aircraft = aircraftMap[aircraftId];
        const newAircraftTrack: AircraftTrack = {
          aircraftId,
          altitudeAgl: aircraft.altitudeAgl,
          altitudeTrue: aircraft.altitudeTrue,
          groundSpeed: aircraft.groundSpeed,
          location: aircraft.location,
          typeCode: aircraft.typeCode,
          lastUpdated: new Date(aircraft.lastUpdatedAt).getTime()
        };
        newTracks[aircraftId] = newAircraftTrack;
        if (entry && !entry.aclDisplay && depFilter(entry, newAircraftTrack, sectorData.artccId)) {
          dispatch(addEntryToDep(aircraftId));
        } else if (!entry.aclDisplay) {
          dispatch(addEntryToAcl(aircraftId));
        }
      }
    });
    console.log(newTracks);
    dispatch(setTracks(newTracks));
  };
}