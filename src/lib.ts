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
import {EdstEntryType, RouteFixType, LocalEdstEntryType, ReferenceFixType} from "./types";
import {toast} from "./components/toast/ToastManager";
import * as geomag from 'geomag';
import _ from "lodash";

export const REMOVAL_TIMEOUT = 120000;

function signedDistancePointToPolygon(point: Point, polygon: Feature<Polygon>) {
  // @ts-ignore
  let dist = pointToLineDistance(point, polygonToLineString(polygon), {units: 'nauticalmiles'});
  if (booleanPointInPolygon(point, polygon)) {
    dist = dist * -1;
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
  for (const poly of polygons) {
    let dist = signedDistancePointToPolygon(point, poly);
    const stratumLow = poly.properties?.alt_low;
    const stratumHigh = poly.properties?.alt_high;
    if (!(stratumLow && stratumHigh)) {
      minDistance = Math.min(minDistance, dist);
    } else if ((altitude > Number(stratumLow) && altitude < Number(stratumHigh))) {
      minDistance = Math.min(minDistance, dist);
    } else if (interim && interim > Number(stratumLow) && interim < Number(stratumHigh)) {
      minDistance = Math.min(minDistance, dist);
    }
  }
  return minDistance;
}

/**
 * Check whether a given route will enter a controller's airspace based on sector boundary
 * @param {string} route - truncated route string
 * @param {RouteFixType[]} routeData - fixes on the route (order matters)
 * @param {Polygon[]} polygons - airspace defining boundaries
 * @param {Position} pos - lon/lat pair, current position
 * @returns {boolean}
 */
export function routeWillEnterAirspace(route: string, routeData: RouteFixType[] | null, polygons: Feature<Polygon>[], pos: Position): boolean {
  if (routeData === null || route.length === 0) {
    return false;
  }
  route = route.replace(/^\.*\[XXX\]\.*/g, '');
  const indexToSplit = route.indexOf('[XXX]');
  const routeToProcess = indexToSplit > 0 ? route.slice(0, indexToSplit).replace(/'\.+$/g, '') : route;
  let fixNames = routeData.map((e: { name: string }) => e.name);
  const lastFixIndex = fixNames.indexOf(routeToProcess.split('.').pop() as string);
  let routeDataToProcess = routeData.slice(0, lastFixIndex);
  routeDataToProcess.unshift({pos: pos, name: 'ppos'});
  if (routeDataToProcess.length > 1) {
    const nextFix = getNextFix(route, routeDataToProcess, pos)[0] as RouteFixType;
    const index = fixNames.indexOf(nextFix.name);
    routeDataToProcess = routeDataToProcess.slice(index);
    routeDataToProcess.unshift({name: 'ppos', pos: pos});
    const lines = lineString(routeDataToProcess.map(e => e.pos));
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
 * @param {RouteFixType[]} routeData - fixes on the route (order matters)
 * @param {Position} pos - lon/lat pair, current position
 * @returns {RouteFixType[]} - original routeData, but each item will have a `distance` attribute
 */
export function getRouteDataDistance(routeData: RouteFixType[], pos: Position): (RouteFixType & { dist: number })[] {
  for (let fix of routeData) {
    fix.dist = distance(point(fix.pos), point(pos), {units: 'nauticalmiles'});
  }
  return routeData as (RouteFixType & { dist: number })[];
}

/**
 * compute the remaining route and its route data, based on current position
 * @param {string} route - parsed route string
 * @param {RouteFixType[]} routeData - fixes on the route
 * @param {Position} pos - lon/lat pair, current position
 * @param {Feature<Polygon>[]} polygons - airspace defining polygons
 * @param {string} dest - ICAO string of destination airport
 * @returns {{_route: string, _route_data: RouteFixType[]}}
 */
export function getRemainingRouteData(route: string, routeData: (RouteFixType & { dist: number })[], pos: Position, dest: string, polygons?: Feature<Polygon>[]): { _route: string, _route_data: RouteFixType[] } {
  if (routeData.length > 1) {
    let fixNames = routeData.map(e => e.name);
    if (fixNames.slice(-1)[0] === dest) {
      fixNames.pop();
    }
    let firstFixToShow = routeData[0];
    if (polygons) {
      for (let fix of routeData) {
        if (polygons.filter(polygon => booleanPointInPolygon(fix.pos, polygon)).length > 0) {
          break;
        }
        firstFixToShow = fix;
      }
    }
    // compute route string starting from firstFixToShow
    for (let name of fixNames.slice(0, fixNames.indexOf(firstFixToShow.name) + 1).reverse()) {
      let index = route.lastIndexOf(name);
      if (index > -1) {
        route = route.slice(index + name.length);
        if (!Number(route[0])) {
          route = `..${firstFixToShow.name}` + route;
        } else {
          route = `..${firstFixToShow.name}.${name}${route}`;
        }
        break;
      }
    }
    routeData = routeData.slice(routeData.indexOf(firstFixToShow));
  }
  return {_route: route, _route_data: routeData};
}

export function getNextFix(route: string, routeData: RouteFixType[], pos: Position): (RouteFixType & { dist: number })[] {
  const routeDataWithDistance = getRouteDataDistance(_.cloneDeep(routeData), pos);
  if (routeDataWithDistance.length > 1) {
    let fixNames = routeData.map((e: { name: string }) => e.name);
    const sortedRouteData = routeDataWithDistance.sort((u, v) => u.dist - v.dist);
    const closestFix = sortedRouteData[0];
    const index = fixNames.indexOf(closestFix.name);
    if (index === routeDataWithDistance.length - 1) {
      return [closestFix];
    }
    const followingFix = routeDataWithDistance[index + 1];
    const line = lineString([closestFix.pos, followingFix.pos]);
    const lineDistance = pointToLineDistance(pos, line, {units: 'nauticalmiles'});
    return (lineDistance >= closestFix.dist) ? [closestFix, followingFix] : [followingFix, closestFix];
  } else {
    return routeDataWithDistance;
  }
}

/**
 * compute frd to the closest reference fix
 * @param {any[]} referenceFixes - list of reference fixes
 * @param {Feature<Point>} posPoint - present position
 * @returns {ReferenceFixType} - closest reference fix
 */
export function getClosestReferenceFix(referenceFixes: any[], posPoint: Feature<Point>): ReferenceFixType {
  const fixesDistance = referenceFixes.map(fix => {
    const fixPoint = point([fix.lon, fix.lat]);
    return Object.assign({
      point: fixPoint,
      distance: distance(fixPoint, posPoint, {units: 'nauticalmiles'})
    }, fix);
  });
  let closestFix = fixesDistance.sort((u, v) => u.distance - v.distance)[0];
  closestFix.bearing = (bearing(closestFix.point, posPoint) + 360) % 360;
  return closestFix;
}


export function processAar(entry: Partial<LocalEdstEntryType>, aar_list: Array<any>) {
  const {_route_data: currentRouteData, _route: currentRoute} = entry;
  if (!currentRouteData || !currentRoute) {
    return null;
  }
  return aar_list?.map(aar_data => {
    const {route_fixes: routeFixes, amendment} = aar_data;
    const {fix: tfix, info: tfixInfo} = amendment.tfix_details;
    const currentRouteDataFixNames = currentRouteData.map(fix => fix.name);
    // if the current route data does not contain the tfix, this aar will not apply
    if (!currentRouteDataFixNames.includes(tfix)) {
      return null;
    }
    let {route: aarLeadingRouteString, aar_amendment: aarAmendmentRouteString} = amendment;
    let amendedRouteString = aarAmendmentRouteString;
    const currentRouteDataTfixIndex = currentRouteDataFixNames.indexOf(tfix);
    const remainingFixNames = currentRouteDataFixNames.slice(0, currentRouteDataTfixIndex)
      .concat(routeFixes.slice(routeFixes.indexOf(tfix)));
    if (tfixInfo === 'Prepend') {
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
      amendedRouteString = currentRoute.slice(0, currentRoute.indexOf(firstCommonSegment) + firstCommonSegment.length)
        + aarLeadingRouteString.slice(aarLeadingRouteString.indexOf(firstCommonSegment) + firstCommonSegment.length);
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
      tfix: tfix,
      tfix_info: tfixInfo,
      eligible: amendment.eligible,
      onEligibleAar: amendment.eligible && currentRoute.includes(aarAmendmentRouteString),
      aar_data: aar_data
    };
  }).filter(aar_data => aar_data);
}

/**
 * computes how long it will take until an aircraft will enter a controller's airspace
 * @param {LocalEdstEntryType} entry - an EDST entry
 * @param {Feature<Polygon>[]} polygons - airspace boundaries
 * @returns {number} - minutes until the aircraft enters the airspace
 */
export function computeBoundaryTime(entry: EdstEntryType, polygons: Feature<Polygon>[]): number {
  const pos = [entry.flightplan.lon, entry.flightplan.lat];
  const posPoint = point(pos);
  // @ts-ignore
  const sdist = getSignedStratumDistancePointToPolygons(posPoint, polygons, entry.flightplan.altitude, entry.interim);
  return sdist * 60 / entry.flightplan.ground_speed;
}

/**
 *
 * @param {LocalEdstEntryType} entry
 * @returns {RouteFixType[]}
 */
export function computeCrossingTimes(entry: LocalEdstEntryType): (RouteFixType & { minutesAtFix: number })[] {
  let newRouteData = [];
  if (entry._route_data) {
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const groundspeed = Number(entry.flightplan?.ground_speed);
    if (entry._route_data.length > 0 && groundspeed > 0) {
      let lineData = [[entry.flightplan?.lon, entry.flightplan?.lat]];
      for (let fix of entry._route_data) {
        lineData.push(fix.pos);
        newRouteData.push({
          ...fix,
          minutesAtFix: utcMinutes + 60 * length(lineString(lineData), {units: 'nauticalmiles'}) / groundspeed
        });
      }
    }
  }
  return newRouteData;
}

/**
 * compute the FRD string from reference fix data
 * @param {{waypoint_id: string, bearing: number, distance: number}} referenceFix
 * @returns {string} - fix/radial/distance in standard format: ABC123456
 */
export function computeFrd(referenceFix: ReferenceFixType): string {
  const magneticVariation = geomag.field(referenceFix.point.geometry.coordinates[1], referenceFix.point.geometry.coordinates[0]).declination;
  return referenceFix.waypoint_id + Math.round(referenceFix.bearing - magneticVariation).toString().padStart(3, '0')
    + Math.round(referenceFix.distance).toString().padStart(3, '0');
}

/**
 * given a number, representing minutes elapsed after midnight, give the corresponding UTC string HHMM format
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
  toast.show({
    title: "copied to clipboard",
    content: text,
    duration: 3000,
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

export function getClearedToFixRouteData(clearedFixName: string, entry: LocalEdstEntryType, referenceFixes: ReferenceFixType[] | null):
  { route: string, route_data: RouteFixType[], cleared_direct: { frd: string | null, fix: string } } | null {
  let {_route: newRoute, _route_data: routeData, dest} = entry;
  if (newRoute && routeData) {
    let fixNames = routeData.map((e: { name: string }) => e.name);
    const closestReferenceFix = referenceFixes ? getClosestReferenceFix(referenceFixes, point([entry.flightplan.lon, entry.flightplan.lat])) : null;
    const frd = closestReferenceFix ? computeFrd(closestReferenceFix) : null;

    const index = fixNames.indexOf(clearedFixName);
    for (let name of fixNames.slice(0, index + 1).reverse()) {
      if (newRoute.includes(name)) {
        newRoute = newRoute.slice(newRoute.indexOf(name) + name.length);
        if (!Number(newRoute[0])) {
          newRoute = `..${clearedFixName}` + newRoute;
        } else {
          newRoute = `..${clearedFixName}.${name}${newRoute}`;
        }
        break;
      }
    }
    // new_route = `..${fix}` + new_route;
    newRoute = removeDestFromRouteString(newRoute.slice(0), dest);
    // navigator.clipboard.writeText(`${!dep ? frd : ''}${new_route}`); // this only works with https or localhost
    copy(`${frd ?? ''}${newRoute}`.replace(/\.+$/, ''));
    return {
      route: newRoute,
      route_data: routeData.slice(index),
      cleared_direct: {frd: (frd ?? null), fix: clearedFixName}
    };
  }
  return null;
}

export function equipmentIcaoToNas(field10a: string, field10b: string): string {
  let nasSuffix = '';
  if (field10a.includes('W')) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      if (field10a.includes('G')) {
        nasSuffix = 'L';
      } else if (field10b.match(/[RCIX]/g)?.length) {
        nasSuffix = 'Z';
      } else {
        nasSuffix = 'W';
      }
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = 'H';
    }
  } else if (field10a.includes('G')) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      nasSuffix = 'G';
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = 'S';
    } else {
      nasSuffix = 'V';
    }
  } else if (field10a.match(/[RCIX]/g)?.length) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      nasSuffix = 'I';
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = 'C';
    } else {
      nasSuffix = 'Y';
    }
  } else if (field10a.includes('D')) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      nasSuffix = 'A';
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = 'B';
    } else {
      nasSuffix = 'D';
    }
  } else if (field10a.includes('T')) {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      nasSuffix = 'P';
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = 'N';
    } else {
      nasSuffix = 'M';
    }
  } else {
    if (field10b.match(/[CPSEHL]/g)?.length) {
      nasSuffix = 'U';
    } else if (field10b.match(/[AXIN]/g)?.length) {
      nasSuffix = 'T';
    } else {
      nasSuffix = 'X';
    }
  }
  return nasSuffix;
}

export function getDepString(dep?: string): string | null {
  return dep ? `${dep}\u{2191}` : null;
}

export function getDestString(dest?: string): string | null {
  return dest ? `${dest}\u{2193}` : null;
}