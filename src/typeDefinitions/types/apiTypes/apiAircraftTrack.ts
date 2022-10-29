import type { ApiLocation } from "./apiLocation";
import type { Nullable } from "../utility-types";

export type ApiAircraftTrack = {
  aircraftId: string;
  altitudeAgl: number;
  altitudeTrue: number;
  groundSpeed: number;
  location: ApiLocation;
  typeCode: Nullable<string>;
  interimAltitude?: number;
};
