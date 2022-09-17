import { lineString, Position } from "@turf/turf";
import { RouteFix } from "../typeDefinitions/types/routeFix";
import { getRemainingFixesFromPpos } from "./fixes";

export function getRouteLineString(routeFixes: RouteFix[], pos: Position) {
  const remainingFixes = getRemainingFixesFromPpos(routeFixes, pos);
  const positions = remainingFixes?.map(fix => fix.pos);
  return positions ? lineString(positions) : null;
}
