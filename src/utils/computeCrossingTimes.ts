import { length, lineString } from "@turf/turf";
import { EdstEntry } from "../typeDefinitions/types/edstEntry";
import { RouteFix } from "../typeDefinitions/types/routeFix";
import { ApiAircraftTrack } from "../typeDefinitions/types/apiTypes/apiAircraftTrack";
import { locationToPosition } from "./locationToPosition";

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
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    if (routeFixes.length > 0 && track.groundSpeed > 0) {
      const lineData = [locationToPosition(track.location)];
      routeFixes.forEach(fix => {
        lineData.push(fix.pos);
        newRouteFixes.push({
          ...fix,
          minutesAtFix: Math.floor(utcMinutes + length(lineString(lineData), { units: "nauticalmiles" }) * (60 / track.groundSpeed))
        });
      });
    }
  }
  return newRouteFixes;
}
