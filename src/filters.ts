import { distance, Feature, point, Polygon, Position } from "@turf/turf";
import { AircraftTrack, LocalEdstEntry } from "./types";
import { routeWillEnterAirspace } from "./lib";

const BOUNDARY_TIME_FILTER = 30; // minutes
const AIRBORNE_GROUNDSPEED_FILTER = 30; // knots

export const depFilter = (entry: LocalEdstEntry, track: AircraftTrack, artccId: string) => {
  let depAirportDistance = 0;
  if (entry.depInfo) {
    const pos = [track.location.lon, track.location.lat];
    const depPos = [entry.depInfo.lon, entry.depInfo.lat];
    depAirportDistance = distance(point(depPos), point(pos), { units: "nauticalmiles" });
  }
  return Number(track.groundSpeed) < AIRBORNE_GROUNDSPEED_FILTER && entry.depInfo?.artcc?.toLowerCase() === artccId && depAirportDistance < 20;
};

export const entryFilter = (entry: LocalEdstEntry, track: AircraftTrack, polygons: Feature<Polygon>[]) => {
  const pos: Position = [track.location.lon, track.location.lat];
  const willEnterAirspace =
    entry.currentRouteFixes && entry.currentRoute
      ? routeWillEnterAirspace(entry.currentRoute, entry.currentRouteFixes.slice(0), polygons, pos)
      : false;
  return track.altitudeTrue > 500 && entry.boundaryTime < BOUNDARY_TIME_FILTER && willEnterAirspace; // && Number(track.groundSpeed) > AIRBORNE_GROUNDSPEED_FILTER;
};
