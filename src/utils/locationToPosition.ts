import type { Position } from "geojson";
import type { ApiLocation } from "types/apiTypes/apiLocation";

export function locationToPosition(location: ApiLocation): Position {
  return [Number(location.lon), Number(location.lat)];
}
