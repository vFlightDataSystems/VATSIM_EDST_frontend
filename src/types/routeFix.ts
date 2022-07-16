import { Position } from "@turf/turf";

export type RouteFix = {
  name: string;
  pos: Position;
  dist?: number;
  minutesAtFix?: number;
};
