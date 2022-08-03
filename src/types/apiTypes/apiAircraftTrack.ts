import { ApiLocation } from "./apiLocation";

export type ApiAircraftTrack = {
  aircraftId: string;
  altitudeAgl: number;
  altitudeTrue: number;
  groundSpeed: number;
  location: ApiLocation;
  typeCode: string | null;
  interimAltitude?: number;
};
