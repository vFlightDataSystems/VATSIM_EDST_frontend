import {
  bearing,
  booleanPointInPolygon, distance, Feature,
  lineString, Point,
  point,
  pointToLineDistance, Polygon,
  polygonToLineString
} from "@turf/turf";
import booleanIntersects from "@turf/boolean-intersects";
import {EdstEntryProps, FixProps} from "./interfaces";

export const REMOVAL_TIMEOUT = 120000;

/**
 * Computes the signed distance from a given point to the union of all polygons (in nm).
 * The returned value is negative if the point is inside of one of the polygons.
 * @param {Point} point - current position
 * @param {Array<Polygon>} polygons - airspace defining boundaries
 * @returns {number}
 */
export function getSignedDistancePointToPolygons(point: Point, polygons: Array<Polygon>): number {
  let min_distance = Infinity;
  for (const poly of polygons) {
    // @ts-ignore
    let dist = pointToLineDistance(point, polygonToLineString(poly), {units: 'nauticalmiles'});
    if (booleanPointInPolygon(point, poly)) {
      dist = dist * -1;
    }
    min_distance = Math.min(min_distance, dist);
  }
  return min_distance;
}

/**
 * Check whether a given route will enter a controller's airspace based on sector boundary
 * @param {Array<any>} route_data - fixes on the route (order matters)
 * @param {Array<Polygon>} polygons - airspace defining boundaries
 * @param {Array<number>} pos - lon/lat pair, current position
 * @returns {boolean}
 */
export function routeWillEnterAirspace(route_data: Array<FixProps>, polygons: Array<Polygon>, pos: [number, number]): boolean {
  if (!route_data) {
    return false;
  }
  route_data.unshift({pos: pos, name: 'ppos'});
  if (route_data.length > 1) {
    const lines = lineString(route_data.map(e => e.pos));
    for (const poly of polygons) {
      if (booleanIntersects(lines, poly)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Compute the distance to each fix on the route and save it in the route data
 * @param {Array<any>} route_data - fixes on the route (order matters)
 * @param {[number, number]} pos - lon/lat pair, current position
 * @returns {Array<any>} - original route_data, but each item will have a `distance` attribute
 */
export function getRouteDataDistance(route_data: Array<any>, pos: [number, number]): Array<any> {
  for (let fix of route_data) {
    fix.dist = distance(point(fix.pos), point(pos), {units: 'nauticalmiles'});
  }
  return route_data;
}

/**
 * compute the remaining route and its route data, based on current position
 * @param {string} route - parsed route string
 * @param {Array<any>} route_data - fixes on the route
 * @param {[number, number]} pos - lon/lat pair, current position
 * @returns {{_route: string, _route_data: Array<any>}}
 */
export function getRemainingRouteData(route: string, route_data: Array<any>, pos: [number, number]): { _route: string, _route_data: Array<any> } {
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

/**
 * compute frd to the closest reference fix
 * @param {Array<any>} reference_fixes - list of reference fixes
 * @param {Feature<Point>} pos_point - present position
 * @returns {any} - closest reference fix
 */
export function getClosestReferenceFix(reference_fixes: Array<any>, pos_point: Feature<Point>): any {
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

/**
 * computes how long it will take until an aircraft will enter a controller's airspace
 * @param {EdstEntryProps} entry - an EDST entry
 * @param {Array<Polygon>} polygons - airspace boundaries
 * @returns {number} - minutes until the aircraft enters the airspace
 */
export function computeMinutesAway(entry: EdstEntryProps, polygons: Array<Polygon>): number {
  const pos = [entry.flightplan.lon, entry.flightplan.lat];
  const pos_point = point(pos);
  // @ts-ignore
  const sdist = getSignedDistancePointToPolygons(pos_point, polygons);
  return sdist * 60 / entry.flightplan.ground_speed;
}

/**
 * compute the FRD string from reference fix data
 * @param {{waypoint_id: string, bearing: number, distance: number}} reference_fix
 * @returns {string} - fix/radial/distance in standard format: ABC123456
 */
export function computeFrd(reference_fix: { waypoint_id: string, bearing: number, distance: number }): string {
  return reference_fix.waypoint_id + Math.round(reference_fix.bearing).toString().padStart(3, '0')
    + Math.round(reference_fix.distance).toString().padStart(3, '0');
}

/**
 * given a number, representing minutes minutes elapsed after midnight, give the corresponding UTC string HHMM format
 * @param {number} minutes - minutes after midnight
 * @returns {string} - UTC time string in HHMM format
 */
export function formatUtcMinutes(minutes: number): string {
  return (((minutes % 1440 + 1440) / 60 | 0) % 24).toString().padStart(2, "0") + ((minutes + 60) % 60 | 0).toString().padStart(2, "0");
}

export function copy(text: string) {
  const input = document.createElement('textarea');
  input.innerHTML = text;
  document.body.appendChild(input);
  input.select();
  const result = document.execCommand('copy');
  document.body.removeChild(input);
  return result;
}

// This is an assign function that copies full descriptors
export function completeAssign(target, ...sources) {
  sources.forEach(source => {
    let descriptors = Object.keys(source).reduce((descriptors, key) => {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
      return descriptors;
    }, {});

    // By default, Object.assign copies enumerable Symbols, too
    Object.getOwnPropertySymbols(source).forEach(sym => {
      let descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor.enumerable) {
        descriptors[sym] = descriptor;
      }
    });
    Object.defineProperties(target, descriptors);
  });
  return target;
}