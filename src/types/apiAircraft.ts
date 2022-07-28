import { AircraftId } from "./aircraftId";
import { ApiLocation } from "./apiLocation";

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
  reportedBeaconCode: number | null;
};
