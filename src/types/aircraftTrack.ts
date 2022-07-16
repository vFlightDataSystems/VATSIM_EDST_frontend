import { ApiAircraftTrack } from "./apiAircraftTrack";
import { UnixTime } from "./unixTime";

export type AircraftTrack = ApiAircraftTrack & { lastUpdated: UnixTime };
