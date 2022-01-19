import {
  bearing,
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
  if (!route_data) {
    return false;
  }
  route_data.unshift({pos: pos});
  if (route_data.length > 1) {
    const lines = lineString(route_data.map(e => e.pos));
    for (const poly of polygons) {
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
    const sorted_route_data = route_data.slice(0).sort((u, v) => u.dist - v.dist);
    const closest_fix = sorted_route_data[0];
    const index = route_data.indexOf(closest_fix);
    if (index === route_data.length - 1) {
      return {_route: `.${closest_fix.name}`, _route_data: [closest_fix]};
    }
    const following_fix = route_data[index + 1];
    const pos_point = point(pos);
    const line = lineString([closest_fix.pos, following_fix.pos]);
    const line_distance = pointToLineDistance(pos_point, line, {units: 'nauticalmiles'});
    const next_fix = (line_distance >= closest_fix.dist) ? closest_fix : following_fix;
    for (let name of fix_names.slice(0, fix_names.indexOf(next_fix.name) + 1).reverse()) {
      let index = route.lastIndexOf(name);
      if (index > -1) {
        route = route.slice(index + name.length);
        if (!Number(route[0])) {
          route = `..${next_fix.name}` + route;
        } else {
          route = `..${next_fix.name}.${name}${route}`;
        }
        break;
      }
    }
    route_data = route_data.slice(route_data.indexOf(next_fix));
  }
  return {_route: route, _route_data: route_data};
}

export function getClosestReferenceFix(reference_fixes, pos_point) {
  const fixes_distance = reference_fixes.map(fix => {
    const fix_point = point([fix.lon, fix.lat]);
    return Object.assign({
      point: fix_point,
      distance: distance(fix_point, pos_point, {units: 'nauticalmiles'})
    }, fix);
  });
  let closest_fix = fixes_distance.sort((u, v) => u.distance - v.distance)[0];
  closest_fix.bearing = (bearing(closest_fix.point, pos_point) + 360) % 360;
  return closest_fix;
}


export function computeFrd(reference_fix) {
  return reference_fix.waypoint_id + Math.round(reference_fix.bearing).toString().padStart(3, '0')
    + Math.round(reference_fix.distance).toString().padStart(3, '0');
}

export function formatUtcMinutes(minutes) {
  return ((minutes / 60 | 0) % 24).toString().padStart(2, "0") + (minutes % 60 | 0).toString().padStart(2, "0");
}