import type { AircraftId } from "types/aircraftId";
import type { ApiLocation } from "types/apiTypes/apiLocation";
import type { Nullable } from "types/utility-types";

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
