import {
  booleanPointInPolygon, distance,
  lineString,
  point,
  pointToLineDistance,
  polygonToLineString
} from "@turf/turf";
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
    const lines = lineString(route_data?.map(e => e.pos));
    return booleanIntersects(lines, poly);
  }
  else {
    return false;
  }
}

export function getRouteDataDistance(route_data, pos) {
  for (let e of route_data) {
    e.dist = distance(point(e.pos), point(pos));
  }
  return route_data;
}

export function getRemainingRouteData(route, route_data) {
  if (route_data.length > 1) {
    const fixes = route_data?.map(e => e.fix);
    const sorted_route_data = route_data.slice()?.sort((u, v) => u.dist > v.dist);
    route_data = route_data.slice(route_data.indexOf(sorted_route_data[0]));
    const closest_fix = sorted_route_data[0].fix;
    const second_closest_fix = sorted_route_data[1].fix;
    const next_fix = fixes.indexOf(closest_fix) < fixes.indexOf(second_closest_fix) ? closest_fix : second_closest_fix;
    for (let fix of fixes.slice(0, fixes.indexOf(next_fix)+1).reverse()) {
      if (route.includes(fix)) {
        route = route.slice(route.indexOf(fix) + fix.length);
        route = `.${next_fix}` + route;
        break;
      }
    }
  }
  return {_route: route, _route_data: route_data};
}
