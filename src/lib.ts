import {
  bearing,
  booleanPointInPolygon, distance, Feature, length,
  lineString, Point,
  point,
  pointToLineDistance, Polygon,
  polygonToLineString
} from "@turf/turf";
import booleanIntersects from "@turf/boolean-intersects";
import {EdstEntryType, FixType} from "./types";
import {toast} from "./components/toast/ToastManager";

export const REMOVAL_TIMEOUT = 120000;

/**
 * Computes the signed distance from a given point to the union of all polygons (in nm).
 * The returned value is negative if the point is inside of one of the polygons.
 * @param {Point} point - current position
 * @param {Array<Polygon>} polygons - airspace defining boundaries
 * @returns {number}
 */
export function getSignedDistancePointToPolygons(point: Point, polygons: Array<Polygon>): number {
  let minDistance = Infinity;
  for (const poly of polygons) {
    // @ts-ignore
    let dist = pointToLineDistance(point, polygonToLineString(poly), {units: 'nauticalmiles'});
    if (booleanPointInPolygon(point, poly)) {
      dist = dist* -1;
    }
    minDistance = Math.min(minDistance, dist);
  }
  return minDistance;
}

/**
 * Check whether a given route will enter a controller's airspace based on sector boundary
 * @param {Array<any>} routeData - fixes on the route (order matters)
 * @param {Array<Polygon>} polygons - airspace defining boundaries
 * @param {[number, number]} pos - lon/lat pair, current position
 * @returns {boolean}
 */
export function routeWillEnterAirspace(routeData: FixType[] | null, polygons: Array<Feature<Polygon>>, pos: [number, number]): boolean {
  if (routeData === null) {
    return false;
  }
  routeData.unshift({pos: pos, name: 'ppos'});
  if (routeData.length > 1) {
    const lines = lineString(routeData.map(e => e.pos));
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
 * @param {FixType[]} routeData - fixes on the route (order matters)
 * @param {[number, number]} pos - lon/lat pair, current position
 * @returns {Array<any>} - original route_data, but each item will have a `distance` attribute
 */
export function getRouteDataDistance(routeData: FixType[], pos: [number, number]): Array<any> {
  for (let fix of routeData) {
    fix.dist = distance(point(fix.pos), point(pos), {units: 'nauticalmiles'});
  }
  return routeData;
}

/**
 * compute the remaining route and its route data, based on current position
 * @param {string} route - parsed route string
 * @param {Array<any>} routeData - fixes on the route
 * @param {[number, number]} pos - lon/lat pair, current position
 * @returns {{_route: string, _route_data: Array<any>}}
 */
export function getRemainingRouteData(route: string, routeData: (FixType & {dist: number})[], pos: [number, number]): { _route: string, _route_data: FixType[] } {
  if (routeData.length > 1) {
    const fixNames = routeData.map(e => e.name);
    const sortedRouteData = routeData.slice(0).sort((u, v) => u.dist - v.dist);
    const closestFix = sortedRouteData[0];
    const index = routeData.indexOf(closestFix);
    if (index === routeData.length - 1) {
      return {_route: `.${closestFix.name}`, _route_data: [closestFix]};
    }
    const followingFix = routeData[index + 1];
    const posPoint = point(pos);
    const line = lineString([closestFix.pos, followingFix.pos]);
    const lineDistance = pointToLineDistance(posPoint, line, {units: 'nauticalmiles'});
    const nextFix = (lineDistance >= closestFix.dist) ? closestFix : followingFix;
    for (let name of fixNames.slice(0, fixNames.indexOf(nextFix.name) + 1).reverse()) {
      let index = route.lastIndexOf(name);
      if (index > -1) {
        route = route.slice(index + name.length);
        if (!Number(route[0])) {
          route = `..${nextFix.name}` + route;
        } else {
          route = `..${nextFix.name}.${name}${route}`;
        }
        break;
      }
    }
    routeData = routeData.slice(routeData.indexOf(nextFix));
  }
  return {_route: route, _route_data: routeData};
}

/**
 * compute frd to the closest reference fix
 * @param {Array<any>} referenceFixes - list of reference fixes
 * @param {Feature<Point>} posPoint - present position
 * @returns {any} - closest reference fix
 */
export function getClosestReferenceFix(referenceFixes: Array<any>, posPoint: Feature<Point>): any {
  const fixesDistance = referenceFixes.map(fix => {
    const fixPoint = point([fix.lon, fix.lat]);
    return Object.assign({
      point: fixPoint,
      distance: distance(fixPoint, posPoint, {units: 'nauticalmiles'})
    }, fix);
  });
  let closestFix = fixesDistance.sort((u, v) => u.distance - v.distance)[0];
  closestFix.bearing = (bearing(closestFix.point, posPoint) + 360)%360;
  return closestFix;
}


export function processAar(entry: EdstEntryType, aar_list: Array<any>) {
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
 * @param {EdstEntryType} entry - an EDST entry
 * @param {Array<Polygon>} polygons - airspace boundaries
 * @returns {number} - minutes until the aircraft enters the airspace
 */
export function computeBoundaryTime(entry: EdstEntryType, polygons: Array<Feature<Polygon>>): number {
  const pos = [entry.flightplan.lon, entry.flightplan.lat];
  const posPoint = point(pos);
  // @ts-ignore
  const sdist = getSignedDistancePointToPolygons(posPoint, polygons);
  return sdist*60/entry.flightplan.ground_speed;
}

/**
 *
 * @param {EdstEntryType} entry
 * @returns {FixType[]}
 */
export function computeCrossingTimes(entry: EdstEntryType): (FixType & {minutesAtFix: number})[] {
  let newRouteData = [];
  if (entry._route_data) {
    const now = new Date();
    const utcMinutes = now.getUTCHours()*60 + now.getUTCMinutes();
    const groundspeed = Number(entry.flightplan?.ground_speed);
    if (entry._route_data.length > 0 && groundspeed > 0) {
      let lineData = [[entry.flightplan?.lon, entry.flightplan?.lat]];
      for (let fix of entry._route_data) {
        lineData.push(fix.pos);
        newRouteData.push({
          ...fix,
          minutesAtFix: utcMinutes + 60*length(lineString(lineData), {units: 'nauticalmiles'})/groundspeed
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
export function computeFrd(referenceFix: { waypoint_id: string, bearing: number, distance: number }): string {
  return referenceFix.waypoint_id + Math.round(referenceFix.bearing).toString().padStart(3, '0')
    + Math.round(referenceFix.distance).toString().padStart(3, '0');
}

/**
 * given a number, representing minutes minutes elapsed after midnight, give the corresponding UTC string HHMM format
 * @param {number} minutes - minutes after midnight
 * @returns {string} - UTC time string in HHMM format
 */
export function formatUtcMinutes(minutes: number): string {
  return (((minutes%1440 + 1440)/60 | 0)%24).toString().padStart(2, "0") + ((minutes + 60)%60 | 0).toString().padStart(2, "0");
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