import { Position } from "@turf/turf";

export type RouteFix = {
  name: string;
  pos: Position;
  // distance from present position were applicable
  dist?: number;
  // UTC minutes when aircraft reaches the fix
  minutesAtFix?: number;
};
