import type { UnixTime } from "types/unixTime";
import type { EramTrackDto } from "./apiTypes/EramTrackDto";

export type AircraftTrack = EramTrackDto & { lastUpdated: UnixTime };
