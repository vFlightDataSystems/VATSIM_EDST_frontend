import type { ApiLocation } from "types/apiTypes/apiLocation";
import type { Nullable } from "types/utility-types";

export type ApiAircraftTrack = {
  aircraftId: AircraftId;
  altitudeAgl: number;
  altitudeTrue: number;
  groundSpeed: number;
  location: ApiLocation;
  typeCode: Nullable<string>;
  interimAltitude?: number;
};
