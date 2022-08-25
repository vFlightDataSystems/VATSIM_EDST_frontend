import {
  booleanPointInPolygon,
  distance,
  Feature,
  length,
  lineString,
  Point,
  point,
  pointToLineDistance,
  Polygon,
  polygonToLineString,
  Position
} from "@turf/turf";
import booleanIntersects from "@turf/boolean-intersects";
import _ from "lodash";
import { ApiAircraftTrack } from "./typeDefinitions/types/apiTypes/apiAircraftTrack";
import { RouteFix } from "./typeDefinitions/types/routeFix";
import { EdstEntry } from "./typeDefinitions/types/edstEntry";
import { AircraftTrack } from "./typeDefinitions/types/aircraftTrack";
import { RouteFixWithDistance } from "./typeDefinitions/types/routeFixWithDistance";

export const REMOVAL_TIMEOUT = 120000;

/**
 * returns the positive modulus n mod m
 * @param n
 * @param m
 */
export const mod = (n: number, m: number) => ((n % m) + m) % m;

function signedDistancePointToPolygon(point: Point, polygon: Feature<Polygon>) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let dist = pointToLineDistance(point, polygonToLineString(polygon), { units: "nauticalmiles" });
  if (booleanPointInPolygon(point, polygon)) {
    dist *= -1;
  }
  return dist;
}

/**
 * Computes the signed distance from a given point to the union of all polygons (in nm).
 * The returned value is negative if the point is inside of one of the polygons.
 * @param point - current position
 * @param altitude - filed/assigned altitude
 * @param interim - assigned temp altitude
 * @param polygons - airspace defining boundaries
 */
export function getSignedStratumDistancePointToPolygons(point: Point, polygons: Feature<Polygon>[], altitude: number, interim?: number): number {
  let minDistance = Infinity;
  polygons.forEach(poly => {
    const dist = signedDistancePointToPolygon(point, poly);
    const stratumLow = poly.properties?.alt_low;
    const stratumHigh = poly.properties?.alt_high;
    if (!(stratumLow && stratumHigh)) {
      minDistance = Math.min(minDistance, dist);
    } else if (altitude > Number(stratumLow) && altitude < Number(stratumHigh)) {
      minDistance = Math.min(minDistance, dist);
    } else if (interim && interim > Number(stratumLow) && interim < Number(stratumHigh)) {
      minDistance = Math.min(minDistance, dist);
    }
  });
  return minDistance;
}

/**
 * Check whether a given route will enter a controller's airspace based on sector boundary
 * @param route - truncated route string
 * @param routeFixes - fixes on the route (order matters)
 * @param polygons - airspace defining boundaries
 * @param pos - lon/lat pair, current position
 */
export function routeWillEnterAirspace(route: string, routeFixes: RouteFix[] | null, polygons: Feature<Polygon>[], pos: Position): boolean {
  if (routeFixes === null || route.length === 0) {
    return false;
  }
  route = route.replace(/^\.*\[XXX]\.*/g, "");
  const indexToSplit = route.indexOf("[XXX]");
  const routeToProcess = indexToSplit > 0 ? route.slice(0, indexToSplit).replace(/'\.+$/g, "") : route;
  const fixNames = routeFixes.map(e => e.name);
  const lastFixIndex = fixNames.indexOf(routeToProcess.split(".").pop() as string);
  let routeFixesToProcess = routeFixes.slice(0, lastFixIndex);
  routeFixesToProcess.unshift({ pos, name: "ppos" });
  if (routeFixesToProcess.length > 1) {
    const nextFix = getNextFix(route, routeFixesToProcess, pos) as RouteFix;
    const index = fixNames.indexOf(nextFix.name);
    routeFixesToProcess = routeFixesToProcess.slice(index);
    routeFixesToProcess.unshift({ name: "ppos", pos });
    const lines = lineString(routeFixesToProcess.map(e => e.pos));
    for (let i = 0; i < polygons.length; i++) {
      const poly = polygons[i];
      if (booleanIntersects(lines, poly)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Compute the distance to each fix on the route and save it in the route data
 * @param routeFixes - fixes on the route (order matters)
 * @param pos - lon/lat pair, current aircraft position
 * @returns original routeFixes, but each item will have a `distance` attribute
 */
export function getRouteFixesDistance(routeFixes: RouteFix[], pos: Position): RouteFixWithDistance[] {
  return routeFixes.map(fix => ({ ...fix, dist: distance(point(fix.pos), point(pos), { units: "nauticalmiles" }) })) as RouteFixWithDistance[];
}

/**
 * compute the remaining route and its route data, based on current position
 * @param {string} route - parsed route string
 * @param routeFixes - fixes on the route
 * @param pos - lon/lat pair, current position
 * @param polygons - airspace defining polygons
 * @param dest - ICAO string of destination airport
 * @returns {currentRoute: string, currentRouteFixes: RouteFix[]}
 */
export function getRemainingRouteFixes(
  route: string,
  routeFixes: RouteFixWithDistance[],
  pos: Position,
  dest: string,
  polygons?: Feature<Polygon>[]
): { currentRoute: string; currentRouteFixes: RouteFixWithDistance[] } {
  route = route.slice(0);
  if (routeFixes.length > 1) {
    const fixNames = routeFixes.map(e => e.name);
    if (fixNames.slice(-1)[0] === dest) {
      fixNames.pop();
    }
    let firstFixToShow = routeFixes[0];
    if (polygons) {
      for (let i = 0; i < routeFixes.length; i++) {
        const fix = routeFixes[i];
        if (polygons.filter(polygon => booleanPointInPolygon(fix.pos, polygon)).length > 0) {
          break;
        }
        firstFixToShow = fix;
      }
    }
    // compute route string starting from firstFixToShow
    for (let i = 0; i < fixNames.slice(0, fixNames.indexOf(firstFixToShow.name) + 1).reverse().length; i++) {
      const name = fixNames.slice(0, fixNames.indexOf(firstFixToShow.name) + 1).reverse()[i];
      const index = route.lastIndexOf(name);
      if (index > -1) {
        route = route.slice(index + name.length);
        if (!Number(route[0])) {
          route = `..${firstFixToShow.name}${route}`;
        } else {
          route = `..${firstFixToShow.name}.${name}${route}`;
        }
        break;
      }
    }
    routeFixes = routeFixes.slice(routeFixes.indexOf(firstFixToShow));
  }
  return { currentRoute: route, currentRouteFixes: routeFixes };
}

/**
 * returns the next fix on the route from present position
 * @param route
 * @param routeFixes
 * @param pos
 */
export function getNextFix(route: string, routeFixes: RouteFix[], pos: Position): RouteFixWithDistance | null {
  const routeFixesWithDistance = getRouteFixesDistance(_.cloneDeep(routeFixes), pos);
  if (routeFixesWithDistance.length > 1) {
    const fixNames = routeFixes.map(e => e.name);
    const sortedRouteFixes = _.cloneDeep(routeFixesWithDistance).sort((u, v) => u.dist - v.dist);
    const closestFix = sortedRouteFixes[0];
    const index = fixNames.indexOf(closestFix.name);
    if (index === routeFixesWithDistance.length - 1) {
      return closestFix;
    }
    const followingFix = routeFixesWithDistance[index + 1];
    const line = lineString([closestFix.pos, followingFix.pos]);
    const lineDistance = pointToLineDistance(pos, line, { units: "nauticalmiles" });
    return lineDistance >= closestFix.dist ? closestFix : followingFix;
  }
  return routeFixesWithDistance[0];
}

/**
 * computes how long it will take until an aircraft will enter a controller's airspace
 * @param entry
 * @param track
 * @param polygons - airspace boundaries
 * @returns {number} - minutes until the aircraft enters the airspace
 */
export function computeBoundaryTime(entry: EdstEntry, track: ApiAircraftTrack, polygons: Feature<Polygon>[]): number {
  const pos = [track.location.lon, track.location.lat];
  const posPoint = point(pos);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const sdist = getSignedStratumDistancePointToPolygons(posPoint, polygons, Number(entry.flightplan.altitude), entry.interimAltitude);
  return (sdist * 60) / track.groundSpeed;
}

/**
 *
 * @param entry
 * @param routeFixes
 * @param track
 * @returns {RouteFix[]}
 */
export function computeCrossingTimes(entry: EdstEntry, routeFixes: RouteFix[], track: ApiAircraftTrack): (RouteFix & { minutesAtFix: number })[] {
  const newRouteFixes: (RouteFix & { minutesAtFix: number })[] = [];
  if (routeFixes) {
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    if (routeFixes.length > 0 && track.groundSpeed > 0) {
      const lineData = [[track.location.lon, track.location.lat]];
      routeFixes.forEach(fix => {
        lineData.push(fix.pos);
        newRouteFixes.push({
          ...fix,
          minutesAtFix: Math.floor(utcMinutes + (60 * length(lineString(lineData), { units: "nauticalmiles" })) / track.groundSpeed)
        });
      });
    }
  }
  return newRouteFixes;
}

/**
 * given a number, representing minutes elapsed after midnight, give the corresponding UTC string HHMM format
 * @param minutes - minutes after midnight
 * @returns {string} - UTC time string in HHMM format
 */
export function formatUtcMinutes(minutes: number): string {
  return (
    Math.trunc(mod(minutes / 60, 24))
      .toString()
      .padStart(2, "0") +
    Math.trunc(mod(minutes, 60))
      .toString()
      .padStart(2, "0")
  );
}

/**
 *
 * @param route
 * @param dest - destination airport
 * @returns {string} route string with destination removed from end of route
 */
export function removeDestFromRouteString(route: string, dest: string): string {
  if (route.endsWith(dest)) {
    route = route.slice(0, -dest.length);
  }
  return route;
}

export function removeDepFromRouteString(route: string, dep: string): string {
  if (route.startsWith(dep)) {
    route = route.slice(dep.length);
  }
  return route;
}

/**
 *
 * @param clearedFixName - fix cleared direct to
 * @param entry - EDST entry
 * @param routeFixes
 * @param formattedRoute
 * @param frd - FixRadialDistance
 * @returns all fixes on the remaining route starting from clearedFixName
 */
export function getClearedToFixRouteFixes(
  clearedFixName: string,
  entry: EdstEntry,
  routeFixes: RouteFix[],
  formattedRoute: string,
  frd: string | null
): { route: string; routeFixes: RouteFix[] } | null {
  let newRoute = formattedRoute.slice(0);
  const { destination } = entry;
  if (newRoute && routeFixes) {
    const fixNames = routeFixes.map(e => e.name);

    const index = fixNames.indexOf(clearedFixName);
    const relevantFixNames = fixNames.slice(0, index + 1).reverse();
    for (let i = 0; i < relevantFixNames.length; i++) {
      const name = relevantFixNames[i];
      const fixIndex = newRoute.indexOf(name);
      if (fixIndex >= 0) {
        if (newRoute[fixIndex + name.length].match(/\d/)) {
          newRoute = newRoute.slice(fixIndex);
          newRoute = `${frd ?? ""}..${clearedFixName}.${newRoute}`;
        } else {
          newRoute = newRoute.slice(fixIndex + name.length);
          newRoute = `${frd ?? ""}..${clearedFixName}${newRoute}`;
        }
        break;
      }
    }
    newRoute = removeDestFromRouteString(newRoute.slice(0), destination);
    return {
      route: newRoute,
      routeFixes: routeFixes.slice(index)
    };
  }
  return null;
}

/**
 * appends upward arrow to string, used for indicating a departure airport in a route
 * @param s
 */
export function appendUpArrowToString(s: string): string {
  return `${s}@`; // @ is uparrow in the font
}

/**
 * appends downward arrow to string, used for indicating a destination airport in a route
 * @param s
 */
export function appendDownArrowToString(s: string): string {
  return `${s}#`; // # is downarrow in the font
}

/**
 * format beacon code into 4 digit octal string
 * @param code
 */
export function convertBeaconCodeToString(code?: number | null): string {
  return String(code ?? 0).padStart(4, "0");
}

export function probeConflicts(tracks: AircraftTrack[]): unknown {
  return null;
}
