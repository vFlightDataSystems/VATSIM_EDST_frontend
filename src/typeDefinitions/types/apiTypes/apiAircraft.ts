import type { AircraftId } from "../aircraftId";
import type { ApiLocation } from "./apiLocation";
import type { Nullable } from "../utility-types";

export type ApiAircraft = {
  id: AircraftId;
  lastUpdatedAt: string;
  typeCode: string;
  location: ApiLocation;
  altitudeAgl: number;
  altitudeTrue: number;
  altitudePressure: number;
  groundSpeed: number;
  heading: number;
  reportedBeaconCode: Nullable<number>;
};
