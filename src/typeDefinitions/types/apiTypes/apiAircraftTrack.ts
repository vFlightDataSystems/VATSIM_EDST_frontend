import { ApiLocation } from "./apiLocation";
import { Nullable } from "../../utility-types";

export type ApiAircraftTrack = {
  aircraftId: string;
  altitudeAgl: number;
  altitudeTrue: number;
  groundSpeed: number;
  location: ApiLocation;
  typeCode: Nullable<string>;
  interimAltitude?: number;
};
