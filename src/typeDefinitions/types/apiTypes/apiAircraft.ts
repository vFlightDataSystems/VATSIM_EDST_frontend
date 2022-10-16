import { AircraftId } from "../aircraftId";
import { ApiLocation } from "./apiLocation";
import { Nullable } from "../../utility-types";

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
