import {booleanPointInPolygon, lineString, pointToLineDistance, polygonToLineString} from "@turf/turf";
import booleanIntersects from "@turf/boolean-intersects";

const KM_NM_CONVERSION_FACTOR = 0.53996;

export function getSignedDistancePointToPolygon(point, poly) {

  let dist = pointToLineDistance(point, polygonToLineString(poly)) * KM_NM_CONVERSION_FACTOR;
  if (booleanPointInPolygon(point, poly)) {
    dist = dist * -1;
  }

  return dist;
}

export function routeWillEnterAirspace(route_data, poly) {
  if (route_data?.length > 1) {
    const lines = lineString(route_data?.map(e => e.pos.reverse()));
    return booleanIntersects(lines, poly);
  }
  else {
    return false;
  }
}
