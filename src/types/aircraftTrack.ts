import type { ApiAircraftTrack } from "types/apiTypes/apiAircraftTrack";
import type { UnixTime } from "types/unixTime";

export type AircraftTrack = ApiAircraftTrack & { lastUpdated: UnixTime };
