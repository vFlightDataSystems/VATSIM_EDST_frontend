import { length, lineIntersect, lineSlice } from "@turf/turf";
import type { RouteFix } from "types/routeFix";
import type { ApiAircraftTrack } from "types/apiTypes/apiAircraftTrack";
import { locationToPosition } from "~/utils/locationToPosition";
import { getRouteLineString } from "~/utils/getRouteLineString";

type ProbeConflictArgs = {
  fixes: RouteFix[];
  track: ApiAircraftTrack;
};

export function probeConflict(ac1: ProbeConflictArgs, ac2: ProbeConflictArgs) {
  const pos1 = locationToPosition(ac1.track.location);
  const pos2 = locationToPosition(ac2.track.location);
  const routeLine1 = getRouteLineString(ac1.fixes, pos1);
  const routeLine2 = getRouteLineString(ac2.fixes, pos2);

  if (routeLine1 && routeLine2 && ac1.track.groundSpeed > 0 && ac2.track.groundSpeed > 0) {
    const intersections = lineIntersect(routeLine1, routeLine2);
    if (intersections.features.length > 0) {
      const routeToIntersection1 = lineSlice(pos1, intersections.features[0].geometry, routeLine1);
      const routeToIntersection2 = lineSlice(pos2, intersections.features[0].geometry, routeLine2);
      // minutes until the aircraft reaches intersection based on ground speed
      const timeToFix1 = length(routeToIntersection1, { units: "nauticalmiles" }) * (60 / ac1.track.groundSpeed);
      const timeToFix2 = length(routeToIntersection2, { units: "nauticalmiles" }) * (60 / ac2.track.groundSpeed);
      if (timeToFix1 - timeToFix1 < 3) {
        return [
          {
            routeToIntersection: routeToIntersection1,
            intersection: intersections.features[0].geometry,
            timeToFix: timeToFix1,
          },
          {
            routeToIntersection: routeToIntersection2,
            intersection: intersections.features[0].geometry,
            timeToFix: timeToFix2,
          },
        ];
      }
    }
  }
  return null;
}
