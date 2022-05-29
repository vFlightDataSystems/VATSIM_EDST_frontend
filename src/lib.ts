import {
  bearing,
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
import * as geomag from "geomag";
import _ from "lodash";
import { clipboard } from "@tauri-apps/api";
import { toast } from "./components/toast/ToastManager";
import { EdstEntry, RouteFix, LocalEdstEntry, ReferenceFix, Fix } from "./types";

export const REMOVAL_TIMEOUT = 120000;

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
 * @param {RouteFix[]} routeData - fixes on the route (order matters)
 * @param {Polygon[]} polygons - airspace defining boundaries
 * @param {Position} pos - lon/lat pair, current position
 * @returns {boolean}
 */
export function routeWillEnterAirspace(route: string, routeData: RouteFix[] | null, polygons: Feature<Polygon>[], pos: Position): boolean {
  if (routeData === null || route.length === 0) {
    return false;
  }
  route = route.replace(/^\.*\[XXX]\.*/g, "");
  const indexToSplit = route.indexOf("[XXX]");
  const routeToProcess = indexToSplit > 0 ? route.slice(0, indexToSplit).replace(/'\.+$/g, "") : route;
  const fixNames = routeData.map((e: { name: string }) => e.name);
  const lastFixIndex = fixNames.indexOf(routeToProcess.split(".").pop() as string);
  let routeDataToProcess = routeData.slice(0, lastFixIndex);
  routeDataToProcess.unshift({ pos, name: "ppos" });
  if (routeDataToProcess.length > 1) {
    const nextFix = getNextFix(route, routeDataToProcess, pos)[0] as RouteFix;
    const index = fixNames.indexOf(nextFix.name);
    routeDataToProcess = routeDataToProcess.slice(index);
    routeDataToProcess.unshift({ name: "ppos", pos });
    const lines = lineString(routeDataToProcess.map(e => e.pos));
    // eslint-disable-next-line no-restricted-syntax
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
 * @param {RouteFix[]} routeData - fixes on the route (order matters)
 * @param {Position} pos - lon/lat pair, current position
 * @returns {RouteFix[]} - original routeData, but each item will have a `distance` attribute
 */
export function getRouteDataDistance(routeData: RouteFix[], pos: Position): (RouteFix & { dist: number })[] {
  return routeData.map(fix => {
    fix.dist = distance(point(fix.pos), point(pos), { units: "nauticalmiles" });
    return fix;
  }) as (RouteFix & { dist: number })[];
}

/**
 * compute the remaining route and its route data, based on current position
 * @param {string} route - parsed route string
 * @param {RouteFix[]} routeData - fixes on the route
 * @param {Position} pos - lon/lat pair, current position
 * @param {Feature<Polygon>[]} polygons - airspace defining polygons
 * @param {string} dest - ICAO string of destination airport
 * @returns {{_route: string, _route_data: RouteFix[]}}
 */
export function getRemainingRouteData(
  route: string,
  routeData: (RouteFix & { dist: number })[],
  pos: Position,
  dest: string,
  polygons?: Feature<Polygon>[]
): { _route: string; _route_data: RouteFix[] } {
  if (routeData.length > 1) {
    const fixNames = routeData.map(e => e.name);
    if (fixNames.slice(-1)[0] === dest) {
      fixNames.pop();
    }
    let firstFixToShow = routeData[0];
    if (polygons) {
      // eslint-disable-next-line no-restricted-syntax
      for (const fix of routeData) {
        if (polygons.filter(polygon => booleanPointInPolygon(fix.pos, polygon)).length > 0) {
          break;
        }
        firstFixToShow = fix;
      }
    }
    // compute route string starting from firstFixToShow
    // eslint-disable-next-line no-restricted-syntax
    for (const name of fixNames.slice(0, fixNames.indexOf(firstFixToShow.name) + 1).reverse()) {
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
    routeData = routeData.slice(routeData.indexOf(firstFixToShow));
  }
  return { _route: route, _route_data: routeData };
}

export function getNextFix(route: string, routeData: RouteFix[], pos: Position): (RouteFix & { dist: number })[] {
  const routeDataWithDistance = getRouteDataDistance(_.cloneDeep(routeData), pos);
  if (routeDataWithDistance.length > 1) {
    const fixNames = routeData.map((e: { name: string }) => e.name);
    const sortedRouteData = routeDataWithDistance.sort((u, v) => u.dist - v.dist);
    const closestFix = sortedRouteData[0];
    const index = fixNames.indexOf(closestFix.name);
    if (index === routeDataWithDistance.length - 1) {
      return [closestFix];
    }
    const followingFix = routeDataWithDistance[index + 1];
    const line = lineString([closestFix.pos, followingFix.pos]);
    const lineDistance = pointToLineDistance(pos, line, { units: "nauticalmiles" });
    return lineDistance >= closestFix.dist ? [closestFix, followingFix] : [followingFix, closestFix];
  }
  return routeDataWithDistance;
}

/**
 * compute frd to the closest reference fix
 * @param {any[]} referenceFixes - list of reference fixes
 * @param {Feature<Point>} posPoint - present position
 * @returns {ReferenceFix} - closest reference fix
 */
export function getClosestReferenceFix(referenceFixes: any[], posPoint: Feature<Point>): ReferenceFix {
  const fixesDistance = referenceFixes.map(fix => {
    const fixPoint = point([fix.lon, fix.lat]);
    return { point: fixPoint, distance: distance(fixPoint, posPoint, { units: "nauticalmiles" }), ...fix };
  });
  const closestFix = fixesDistance.sort((u, v) => u.distance - v.distance)[0];
  const magneticVariation = geomag.field(closestFix.point.geometry.coordinates[1], closestFix.point.geometry.coordinates[0]).declination;
  closestFix.bearing = (bearing(closestFix.point, posPoint) - magneticVariation + 360) % 360;
  return closestFix;
}

export function processAar(entry: Partial<LocalEdstEntry>, aarList: any[]) {
  const { currentRoute_data: currentRouteData, currentRoute: route } = entry;
  if (!currentRouteData || !route) {
    return null;
  }
  let currentRoute = route.slice(0);
  if (currentRoute.match(/^\.*[A-Z]+\d{6}/gi)) {
    currentRoute = currentRoute.replace(/^\.*[A-Z]+\d{6}/gi, "");
  }
  return aarList
    ?.map(aarData => {
      const { route_fixes: routeFixes, amendment } = aarData;
      const { fix: tfix, info: tfixInfo } = amendment.tfix_details;
      const currentRouteDataFixNames = currentRouteData.map(fix => fix.name);
      // if the current route data does not contain the tfix, this aar will not apply
      if (!currentRouteDataFixNames.includes(tfix)) {
        return null;
      }
      const aarLeadingRouteString = amendment.route;
      let aarAmendmentRouteString = amendment.aar_amendment;
      let amendedRouteString = aarAmendmentRouteString;
      const currentRouteDataTfixIndex = currentRouteDataFixNames.indexOf(tfix);
      const remainingFixNames = currentRouteDataFixNames.slice(0, currentRouteDataTfixIndex).concat(routeFixes.slice(routeFixes.indexOf(tfix)));
      if (tfixInfo === "Prepend") {
        aarAmendmentRouteString = tfix + aarAmendmentRouteString;
      }
      // if current route contains the tfix, append the aar amendment after the tfix
      if (currentRoute.includes(tfix)) {
        amendedRouteString = currentRoute.slice(0, currentRoute.indexOf(tfix)) + aarAmendmentRouteString;
      } else {
        // if current route does not contain the tfix, append the amendment after the first common segment, e.g. airway
        const firstCommonSegment = currentRoute.split(/\.+/).filter(segment => amendedRouteString?.includes(segment))?.[0];
        if (!firstCommonSegment) {
          return null;
        }
        amendedRouteString =
          currentRoute.slice(0, currentRoute.indexOf(firstCommonSegment) + firstCommonSegment.length) +
          aarLeadingRouteString.slice(aarLeadingRouteString.indexOf(firstCommonSegment) + firstCommonSegment.length);
      }
      if (!amendedRouteString) {
        return null;
      }
      return {
        aar: true,
        aar_amendment_route_string: aarAmendmentRouteString,
        amended_route: amendedRouteString,
        amended_route_fix_names: remainingFixNames,
        dest: entry.dest,
        tfix,
        tfix_info: tfixInfo,
        eligible: amendment.eligible,
        onEligibleAar: amendment.eligible && currentRoute.includes(aarAmendmentRouteString),
        aarData
      };
    })
    .filter(aarData => aarData);
}

/**
 * computes how long it will take until an aircraft will enter a controller's airspace
 * @param {LocalEdstEntry} entry - an EDST entry
 * @param {Feature<Polygon>[]} polygons - airspace boundaries
 * @returns {number} - minutes until the aircraft enters the airspace
 */
export function computeBoundaryTime(entry: EdstEntry, polygons: Feature<Polygon>[]): number {
  const pos = [entry.flightplan.lon, entry.flightplan.lat];
  const posPoint = point(pos);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const sdist = getSignedStratumDistancePointToPolygons(posPoint, polygons, entry.flightplan.altitude, entry.interim);
  return (sdist * 60) / entry.flightplan.ground_speed;
}

/**
 *
 * @param {LocalEdstEntry} entry
 * @returns {RouteFix[]}
 */
export function computeCrossingTimes(entry: LocalEdstEntry): (RouteFix & { minutesAtFix: number })[] {
  const newRouteData: (RouteFix & { minutesAtFix: number })[] = [];
  if (entry.currentRoute_data) {
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const groundspeed = Number(entry.flightplan?.ground_speed);
    if (entry.currentRoute_data.length > 0 && groundspeed > 0) {
      const lineData = [[entry.flightplan?.lon, entry.flightplan?.lat]];
      entry.currentRoute_data.forEach(fix => {
        lineData.push(fix.pos);
        newRouteData.push({
          ...fix,
          minutesAtFix: utcMinutes + (60 * length(lineString(lineData), { units: "nauticalmiles" })) / groundspeed
        });
      });
    }
  }
  return newRouteData;
}

/**
 * compute the FRD string from reference fix data
 * @param {{waypoint_id: string, bearing: number, distance: number}} referenceFix
 * @returns {string} - fix/radial/distance in standard format: ABC123456
 */
export function computeFrdString(referenceFix: ReferenceFix): string {
  return (
    referenceFix.waypoint_id +
    Math.round(referenceFix.bearing)
      .toString()
      .padStart(3, "0") +
    Math.round(referenceFix.distance)
      .toString()
      .padStart(3, "0")
  );
}

/**
 * given a number, representing minutes elapsed after midnight, give the corresponding UTC string HHMM format
 * @param {number} minutes - minutes after midnight
 * @returns {string} - UTC time string in HHMM format
 */
export function formatUtcMinutes(minutes: number): string {
  return (
    (Math.round(((minutes % 1440) + 1440) / 60) % 24).toString().padStart(2, "0") +
    Math.round((minutes + 60) % 60)
      .toString()
      .padStart(2, "0")
  );
}

export function copy(text: string) {
  let result;
  // eslint-disable-next-line no-underscore-dangle
  if (window.__TAURI__) {
    result = clipboard.writeText(text).then(result => result);
  } else {
    result = navigator.clipboard.writeText(text);
  }
  toast.show({
    title: "copied to clipboard",
    content: text,
    duration: 3000
  });
  return result;
}

/**
 *
 * @param {string} route
 * @param {string} dest
 * @returns {string}
 */
export function removeDestFromRouteString(route: string, dest: string): string {
  if (route.slice(-dest.length) === dest) {
    route = route.slice(0, -dest.length);
  }
  return route;
}

export function getClearedToFixRouteData(
  clearedFixName: string,
  entry: LocalEdstEntry,
  referenceFixes: Fix[] | null
): { route: string; route_data: RouteFix[]; cleared_direct: { frd: string | null; fix: string } } | null {
  let newRoute = entry.currentRoute;
  const { currentRoute_data: routeData, dest } = entry;
  if (newRoute && routeData) {
    const fixNames = routeData.map((e: { name: string }) => e.name);
    const closestReferenceFix = referenceFixes ? getClosestReferenceFix(referenceFixes, point([entry.flightplan.lon, entry.flightplan.lat])) : null;
    const frd = closestReferenceFix ? computeFrdString(closestReferenceFix) : null;

    const index = fixNames.indexOf(clearedFixName);
    // eslint-disable-next-line no-restricted-syntax
    for (const name of fixNames.slice(0, index + 1).reverse()) {
      if (newRoute.includes(name)) {
        newRoute = newRoute.slice(newRoute.indexOf(name) + name.length);
        newRoute = `..${clearedFixName}${newRoute}`;
        break;
      }
    }
    // new_route = `..${fix}` + new_route;
    newRoute = removeDestFromRouteString(newRoute.slice(0), dest);
    copy(`${frd ?? ""}${newRoute}`.replace(/\.+$/, "")).then();
    return {
      route: newRoute,
      route_data: routeData.slice(index),
      cleared_direct: { frd: frd ?? null, fix: clearedFixName }
    };
  }
  return null;
}

export function equipmentIcaoToNas(field10a: string, field10b: string): string {
  let nasSuffix = "";
  if (field10a.includes("W")) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      if (field10a.includes("G")) {
        nasSuffix = "L";
      } else if (field10b.match(/[RCIX]/g)?.length) {
        nasSuffix = "Z";
      } else {
        nasSuffix = "W";
      }
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = "H";
    }
  } else if (field10a.includes("G")) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      nasSuffix = "G";
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = "S";
    } else {
      nasSuffix = "V";
    }
  } else if (field10a.match(/[RCIX]/g)?.length) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      nasSuffix = "I";
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = "C";
    } else {
      nasSuffix = "Y";
    }
  } else if (field10a.includes("D")) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      nasSuffix = "A";
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = "B";
    } else {
      nasSuffix = "D";
    }
  } else if (field10a.includes("T")) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      nasSuffix = "P";
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = "N";
    } else {
      nasSuffix = "M";
    }
  } else if (field10b.match(/[CPSEHL]/g)?.length) {
    nasSuffix = "U";
  } else if (field10b.match(/[AXIN]/g)?.length) {
    nasSuffix = "T";
  } else {
    nasSuffix = "X";
  }
  return nasSuffix;
}

export function getDepString(dep?: string): string | null {
  return dep ? `${dep}\u{2191}` : null;
}

export function getDestString(dest?: string): string | null {
  return dest ? `${dest}\u{2193}` : null;
}
