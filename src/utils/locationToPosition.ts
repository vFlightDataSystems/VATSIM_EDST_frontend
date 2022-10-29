import type { Position } from "@turf/turf";
import type { ApiLocation } from "types/apiTypes/apiLocation";

export function locationToPosition(location: ApiLocation): Position {
  return [Number(location.lon), Number(location.lat)];
}
