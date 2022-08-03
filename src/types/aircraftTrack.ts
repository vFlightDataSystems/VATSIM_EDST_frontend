import { ApiAircraftTrack } from "./apiTypes/apiAircraftTrack";
import { UnixTime } from "./unixTime";

export type AircraftTrack = ApiAircraftTrack & { lastUpdated: UnixTime };
