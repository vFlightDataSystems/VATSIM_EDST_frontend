import type { RouteFix } from "types/routeFix";

export type RouteFixWithDistance = RouteFix & {
  // distance from present position were applicable
  dist: number;
  // UTC minutes when aircraft reaches the fix
  minutesAtFix?: number;
};
