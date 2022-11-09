import { length, lineString } from "@turf/turf";
import type { EdstEntry } from "types/edstEntry";
import type { RouteFix } from "types/routeFix";
import type { ApiAircraftTrack } from "types/apiTypes/apiAircraftTrack";
import { locationToPosition } from "~/utils/locationToPosition";
import { getUtcMinutesAfterMidnight } from "~/utils/getUtcMinutesAfterMidnight";

/**
 *
 * @param entry
 * @param routeFixes
 * @param track
 * @returns {RouteFix[]}
 */
export function computeCrossingTimes(entry: EdstEntry, routeFixes: RouteFix[], track: ApiAircraftTrack): (RouteFix & { minutesAtFix: number })[] {
  const newRouteFixes: (RouteFix & { minutesAtFix: number })[] = [];
  if (routeFixes) {
    const utcMinutes = getUtcMinutesAfterMidnight();
    if (routeFixes.length > 0 && track.groundSpeed > 0) {
      const lineData = [locationToPosition(track.location)];
      routeFixes.forEach((fix) => {
        lineData.push(fix.pos);
        newRouteFixes.push({
          ...fix,
          minutesAtFix: Math.floor(utcMinutes + length(lineString(lineData), { units: "nauticalmiles" }) * (60 / track.groundSpeed)),
        });
      });
    }
  }
  return newRouteFixes;
}
