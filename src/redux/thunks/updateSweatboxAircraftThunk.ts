import type { ApiAircraft } from "types/apiTypes/apiAircraft";
import type { AircraftId } from "types/aircraftId";
import type { AircraftTrack } from "types/aircraftTrack";
import type { RootThunkAction } from "~redux/store";
import { setTracks } from "~redux/slices/trackSlice";

export function updateSweatboxAircraftThunk(aircraftList: ApiAircraft[], activateFlightplan: (aircraftId: AircraftId) => void): RootThunkAction {
  return (dispatch, getState) => {
    const { entries } = getState();
    const newTracks: Record<AircraftId, AircraftTrack> = {};
    const aircraftMap = Object.fromEntries(aircraftList.map((aircraft) => [aircraft.id, aircraft]));
    Object.entries(entries).forEach(([aircraftId, entry]) => {
      if (Object.keys(aircraftMap).includes(aircraftId)) {
        const aircraft = aircraftMap[aircraftId];
        newTracks[aircraftId] = {
          aircraftId,
          altitudeAgl: aircraft.altitudeAgl,
          altitudeTrue: aircraft.altitudeTrue,
          groundSpeed: aircraft.groundSpeed,
          location: aircraft.location,
          typeCode: aircraft.typeCode,
          lastUpdated: new Date(aircraft.lastUpdatedAt).getTime(),
        };
        if (entry.status !== "Active" && newTracks[aircraftId].groundSpeed > 40) {
          activateFlightplan(aircraftId);
        }
      }
    });
    dispatch(setTracks(newTracks));
  };
}
