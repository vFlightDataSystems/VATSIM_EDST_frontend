import type { ApiAircraftTrack } from "./apiTypes/apiAircraftTrack";
import type { UnixTime } from "./unixTime";

export type AircraftTrack = ApiAircraftTrack & { lastUpdated: UnixTime };
