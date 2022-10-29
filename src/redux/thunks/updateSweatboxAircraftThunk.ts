import type { ApiAircraft } from "types/apiTypes/apiAircraft";
import type { AircraftId } from "types/aircraftId";
import type { AircraftTrack } from "types/aircraftTrack";
import type { RootThunkAction } from "../store";
import { setTracks } from "../slices/trackSlice";

export function updateSweatboxAircraftThunk(aircraftList: ApiAircraft[], activateFlightplan: (aircraftId: string) => void): RootThunkAction {
  return (dispatch, getState) => {
    const { entries } = getState();
    const newTracks: Record<AircraftId, AircraftTrack> = {};
    const aircraftMap = Object.fromEntries(aircraftList.map((aircraft) => [aircraft.id, aircraft]));
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
          lastUpdated: new Date(aircraft.lastUpdatedAt).getTime(),
        };
        newTracks[aircraftId] = newAircraftTrack;
        if (entry.status !== "Active" && newAircraftTrack.groundSpeed > 40) {
          activateFlightplan(aircraftId);
        }
      }
    });
    dispatch(setTracks(newTracks));
  };
}
