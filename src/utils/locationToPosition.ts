import { Position } from "@turf/turf";
import { ApiLocation } from "../typeDefinitions/types/apiTypes/apiLocation";

export function locationToPosition(location: ApiLocation): Position {
  return [Number(location.lon), Number(location.lat)];
}
