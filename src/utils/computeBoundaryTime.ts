import { Feature, point, Polygon } from "@turf/turf";
import { EdstEntry } from "../typeDefinitions/types/edstEntry";
import { ApiAircraftTrack } from "../typeDefinitions/types/apiTypes/apiAircraftTrack";
import { getSignedStratumDistancePointToPolygons } from "./polygonDistance";
import { locationToPosition } from "./locationToPosition";

/**
 * computes how long it will take until an aircraft will enter a controller's airspace
 * @param entry
 * @param track
 * @param polygons - airspace boundaries
 * @returns {number} - minutes until the aircraft enters the airspace
 */
export function computeBoundaryTime(entry: EdstEntry, track: ApiAircraftTrack, polygons: Feature<Polygon>[]): number {
  const pos = locationToPosition(track.location);
  const posPoint = point(pos);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const sdist = getSignedStratumDistancePointToPolygons(posPoint, polygons, Number(entry.flightplan.altitude), entry.interimAltitude);
  return (sdist * 60) / track.groundSpeed;
}
