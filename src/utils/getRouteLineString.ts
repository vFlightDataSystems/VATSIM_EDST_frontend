import type { Position } from "@turf/turf";
import { lineString } from "@turf/turf";
import type { RouteFix } from "types/routeFix";
import { getRemainingFixesFromPpos } from "~/utils/fixes";

export function getRouteLineString(routeFixes: RouteFix[], pos: Position) {
  const remainingFixes = getRemainingFixesFromPpos(routeFixes, pos);
  const positions = remainingFixes?.map((fix) => fix.pos);
  return positions ? lineString(positions) : null;
}
