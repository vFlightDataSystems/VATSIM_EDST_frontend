import {
  booleanPointInPolygon, distance,
  lineString,
  point,
  pointToLineDistance,
  polygonToLineString
} from "@turf/turf";
import booleanIntersects from "@turf/boolean-intersects";

export const REMOVAL_TIMEOUT = 60000;

export function getSignedDistancePointToPolygons(point, polygons) {
  let min_distance = Infinity;
  for (const poly of polygons) {
    let dist = pointToLineDistance(point, polygonToLineString(poly), {units: 'nauticalmiles'});
    if (booleanPointInPolygon(point, poly)) {
      dist = dist * -1;
    }
    min_distance = Math.min(min_distance, dist);
  }
  return min_distance;
}

export function routeWillEnterAirspace(route_data, polygons, pos) {
  route_data.unshift({pos: pos});
  if (route_data.length > 1) {
    const lines = lineString(route_data?.map(e => e.pos));
    for (let poly of polygons) {
      if (booleanIntersects(lines, poly)) {
        return true
      }
    }
  }
  return false;
}

export function getRouteDataDistance(route_data, pos) {
  for (let fix_data of route_data) {
    fix_data.dist = distance(point(fix_data.pos), point(pos), {units: 'nauticalmiles'});
  }
  return route_data;
}

export function getRemainingRouteData(route, route_data, pos) {
  if (route_data.length > 1) {
    const fix_names = route_data.map(e => e.name);
    const route_data_copy = route_data.slice();
    const sorted_route_data = route_data_copy.sort((u, v) => u.dist - v.dist);
    const closest_fix = sorted_route_data[0];
    const index = route_data.indexOf(closest_fix);
    if (index === route_data.length - 1) {
      return {_route: `.${closest_fix.name}`, _route_data: [closest_fix]};
    }
    const following_fix = route_data[index+1];
    const pos_point = point(pos);
    const line = lineString([closest_fix.pos, following_fix.pos]);
    const line_distance = pointToLineDistance(pos_point, line, {units: 'nauticalmiles'});
    const next_fix = (line_distance >= closest_fix.dist) ? closest_fix : following_fix;
    for (let name of fix_names.slice(0, fix_names.indexOf(next_fix.name)+1).reverse()) {
      if (route.includes(name)) {
        route = route.slice(route.lastIndexOf(name) + name.length);
        route = `..${next_fix.name}` + route;
        break;
      }
    }
    route_data = route_data.slice(route_data.indexOf(next_fix));
  }
  return {_route: route, _route_data: route_data};
}