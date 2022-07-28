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
import { HubConnection } from "@microsoft/signalr";
import { ApiAircraftTrack } from "./types/apiAircraftTrack";
import { RouteFix } from "./types/routeFix";
import { EdstEntry } from "./types/edstEntry";
import { AircraftTrack } from "./types/aircraftTrack";

export const REMOVAL_TIMEOUT = 120000;

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
 * @param {Point} point - current position
 * @param altitude - filed/assigned altitude
 * @param interim - assigned temp altitude
 * @param {Feature<Polygon>[]} polygons - airspace defining boundaries
 * @returns {number}
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
 * @param {string} route - truncated route string
 * @param {RouteFix[]} routeFixes - fixes on the route (order matters)
 * @param {Polygon[]} polygons - airspace defining boundaries
 * @param {Position} pos - lon/lat pair, current position
 * @returns {boolean}
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
 * @param {RouteFix[]} routeFixes - fixes on the route (order matters)
 * @param {Position} pos - lon/lat pair, current position
 * @returns {RouteFix[]} - original routeFixes, but each item will have a `distance` attribute
 */
export function getRouteFixesDistance(routeFixes: RouteFix[], pos: Position): (RouteFix & { dist: number })[] {
  return routeFixes.map(fix => ({ ...fix, dist: distance(point(fix.pos), point(pos), { units: "nauticalmiles" }) })) as (RouteFix & {
    dist: number;
  })[];
}

/**
 * compute the remaining route and its route data, based on current position
 * @param {string} route - parsed route string
 * @param {RouteFix[]} routeFixes - fixes on the route
 * @param {Position} pos - lon/lat pair, current position
 * @param {Feature<Polygon>[]} polygons - airspace defining polygons
 * @param {string} dest - ICAO string of destination airport
 * @returns {currentRoute: string, currentRouteFixes: RouteFix[]}
 */
export function getRemainingRouteFixes(
  route: string,
  routeFixes: (RouteFix & { dist: number })[],
  pos: Position,
  dest: string,
  polygons?: Feature<Polygon>[]
): { currentRoute: string; currentRouteFixes: (RouteFix & { dist: number })[] } {
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

export function getNextFix(route: string, routeFixes: RouteFix[], pos: Position): (RouteFix & { dist: number }) | null {
  const routeFixesWithDistance = getRouteFixesDistance(_.cloneDeep(routeFixes), pos);
  if (routeFixesWithDistance.length > 1) {
    const fixNames = routeFixes.map(e => e.name);
    const sortedRouteFixes = routeFixesWithDistance.sort((u, v) => u.dist - v.dist);
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
 * @param {EdstEntry} entry - an EDST entry
 * @param track
 * @param {Feature<Polygon>[]} polygons - airspace boundaries
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
 * @param {EdstEntry} entry
 * @param track
 * @returns {RouteFix[]}
 */
export function computeCrossingTimes(entry: EdstEntry, track: ApiAircraftTrack): (RouteFix & { minutesAtFix: number })[] {
  const newRouteFixes: (RouteFix & { minutesAtFix: number })[] = [];
  if (entry.currentRouteFixes) {
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    if (entry.currentRouteFixes.length > 0 && track.groundSpeed > 0) {
      const lineData = [[track.location.lon, track.location.lat]];
      entry.currentRouteFixes.forEach(fix => {
        lineData.push(fix.pos);
        newRouteFixes.push({
          ...fix,
          minutesAtFix: utcMinutes + (60 * length(lineString(lineData), { units: "nauticalmiles" })) / track.groundSpeed
        });
      });
    }
  }
  return newRouteFixes;
}

/**
 * given a number, representing minutes elapsed after midnight, give the corresponding UTC string HHMM format
 * @param {number} minutes - minutes after midnight
 * @returns {string} - UTC time string in HHMM format
 */
export function formatUtcMinutes(minutes: number): string {
  return (
    Math.round(mod((minutes % 1440) / 60, 24))
      .toString()
      .padStart(2, "0") +
    Math.round(mod(minutes, 60))
      .toString()
      .padStart(2, "0")
  );
}

/**
 *
 * @param {string} route
 * @param {string} dest
 * @returns {string}
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

export function getClearedToFixRouteFixes(
  clearedFixName: string,
  entry: EdstEntry,
  frd: string | null
): { route: string; routeFixes: RouteFix[] } | null {
  let newRoute = entry.currentRoute;
  const { currentRouteFixes: routeFixes, destination } = entry;
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

export function getDepString(dep?: string): string | null {
  return dep ? `${dep}\u{2191}` : null;
}

export function getDestString(dest?: string): string | null {
  return dest ? `${dest}\u{2193}` : null;
}

export function convertBeaconCodeToString(code?: number | null): string {
  return String(code ?? 0).padStart(4, "0");
}

export function formatAltitude(alt: string): string {
  const altNum = Number(alt);
  return String(altNum >= 1000 ? altNum / 100 : altNum).padStart(3, "0");
}

export async function getFrd(artccId: string, location: { lat: number; lon: number }, hubConnection: HubConnection | null) {
  let frd = null;
  if (hubConnection) {
    frd = await hubConnection.invoke("GenerateFrd", { artccId, location }).catch(error => {
      console.log(error);
      return null;
    });
  }
  return frd;
}

export function probeConflicts(tracks: AircraftTrack[]): unknown {
  return null;
}
