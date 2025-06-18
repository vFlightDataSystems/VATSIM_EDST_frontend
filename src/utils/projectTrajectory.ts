import type { RouteFix } from "types/routeFix";
import type { ApiAircraftTrack } from "types/apiTypes/apiAircraftTrack";
import { locationToPosition } from "~/utils/locationToPosition";
import { getRouteLineString } from "~/utils/getRouteLineString";
import type { Position } from "@turf/turf";
import { along } from "@turf/turf";

export function projectTrajectory(fixes: RouteFix[], track: ApiAircraftTrack) {
  const pos = locationToPosition(track.location);
  const routeLine = getRouteLineString(fixes, pos);
  if (routeLine && typeof track.groundSpeed === "number" && track.groundSpeed > 0) {
    const projectedPositions: Position[] = [];
    // compute position for each seconds in the next 20 minutes
    for (let i = 1; i <= 1200; i++) {
      const position = along(routeLine, (track.groundSpeed * i) / 3600, { units: "nauticalmiles" }).geometry.coordinates;
      projectedPositions.push(position);
    }
    return { time: Date.now() / 1000, projectedPositions };
  }
  return null;
}
