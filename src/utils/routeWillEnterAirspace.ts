import type { Feature, Polygon, Position } from "geojson";
import { lineString } from "@turf/turf";
import booleanIntersects from "@turf/boolean-intersects";
import type { Nullable } from "types/utility-types";
import type { RouteFix } from "types/routeFix";
import { getNextFix } from "~/utils/fixes";

/**
 * Check whether a given route will enter a controller's airspace based on sector boundary
 * @param route - truncated route string
 * @param routeFixes - fixes on the route (order matters)
 * @param polygons - airspace defining boundaries
 * @param pos - lon/lat pair, current position
 */
export function routeWillEnterAirspace(route: string, routeFixes: Nullable<RouteFix[]>, polygons: Feature<Polygon>[], pos: Position): boolean {
  if (routeFixes === null || route.length === 0) {
    return false;
  }
  route = route.replace(/^\.*\[XXX]\.*/g, "");
  const indexToSplit = route.indexOf("[XXX]");
  const routeToProcess = indexToSplit > 0 ? route.slice(0, indexToSplit).replace(/'\.+$/g, "") : route;
  const fixNames = routeFixes.map((e) => e.name);
  const lastFixIndex = fixNames.indexOf(routeToProcess.split(".").pop()!);
  let routeFixesToProcess = routeFixes.slice(0, lastFixIndex);
  routeFixesToProcess.unshift({ pos, name: "ppos" });
  if (routeFixesToProcess.length > 1) {
    const nextFix = getNextFix(routeFixesToProcess, pos);
    const index = fixNames.indexOf(nextFix.name);
    routeFixesToProcess = routeFixesToProcess.slice(index);
    routeFixesToProcess.unshift({ name: "ppos", pos });
    const lines = lineString(routeFixesToProcess.map((e) => e.pos));
    for (let i = 0; i < polygons.length; i++) {
      const poly = polygons[i];
      if (booleanIntersects(lines, poly)) {
        return true;
      }
    }
  }
  return false;
}
