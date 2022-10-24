import _ from "lodash";
import { booleanPointInPolygon, distance, Feature, lineString, point, pointToLineDistance, Polygon, Position } from "@turf/turf";
import { RouteFixWithDistance } from "../typeDefinitions/types/routeFixWithDistance";
import { RouteFix } from "../typeDefinitions/types/routeFix";
import { EdstEntry } from "../typeDefinitions/types/edstEntry";
import { removeStringFromEnd } from "./stringManipulation";
import { Nullable } from "../typeDefinitions/utility-types";

/**
 * Compute the distance to each fix on the route and save it in the route data
 * @param routeFixes - fixes on the route (order matters)
 * @param pos - lon/lat pair, current aircraft position
 * @returns original routeFixes, but each item will have a `distance` attribute
 */
export function getRouteFixesDistance(routeFixes: RouteFix[], pos: Position): RouteFixWithDistance[] {
  return routeFixes.map(fix => ({
    ...fix,
    dist: distance(point(fix.pos), point(pos), { units: "nauticalmiles" })
  }));
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
export function getEnteringRouteFixes(
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
 * @param routeFixes
 * @param pos
 */
export function getNextFix(routeFixes: RouteFix[], pos: Position) {
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
  return routeFixesWithDistance[0] ?? null;
}

export function getRemainingFixesFromPpos(routeFixes: RouteFix[], pos: Position) {
  const fixNames = routeFixes.map(e => e.name);
  if (fixNames.length === 0) {
    return null;
  }
  const nextFix = getNextFix(routeFixes, pos);
  if (nextFix) {
    const index = fixNames.indexOf(nextFix.name);
    const routeFixesToDisplay = routeFixes.slice(index);
    routeFixesToDisplay.unshift({ name: "ppos", pos });
    return routeFixesToDisplay;
  }
  return null;
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
  frd: Nullable<string>
): Nullable<{ route: string; routeFixes: RouteFix[] }> {
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
    newRoute = removeStringFromEnd(newRoute.slice(0), destination);
    return {
      route: newRoute,
      routeFixes: routeFixes.slice(index)
    };
  }
  return null;
}
