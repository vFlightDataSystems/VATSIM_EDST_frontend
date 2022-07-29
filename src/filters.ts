import { distance, Feature, point, Polygon, Position } from "@turf/turf";
import { routeWillEnterAirspace } from "./lib";
import { ApiAircraftTrack } from "./types/apiAircraftTrack";
import { EdstEntry } from "./types/edstEntry";

const BOUNDARY_TIME_FILTER = 30; // minutes
const AIRBORNE_GROUNDSPEED_FILTER = 30; // knots

export const depFilter = (entry: EdstEntry, track: ApiAircraftTrack, artccId: string) => {
  let depAirportDistance = 0;
  if (entry.depInfo) {
    const pos = [track.location.lon, track.location.lat];
    const depPos = [entry.depInfo.lon, entry.depInfo.lat];
    depAirportDistance = distance(point(depPos), point(pos), { units: "nauticalmiles" });
  }
  return Number(track.groundSpeed) < AIRBORNE_GROUNDSPEED_FILTER && entry.depInfo?.artcc?.toUpperCase() === artccId && depAirportDistance < 20;
};

export const aclFilter = (entry: EdstEntry, track: ApiAircraftTrack, polygons: Feature<Polygon>[]) => {
  const pos: Position = [track.location.lon, track.location.lat];
  const willEnterAirspace =
    entry.currentRouteFixes && entry.currentRoute
      ? routeWillEnterAirspace(entry.currentRoute, entry.currentRouteFixes.slice(0), polygons, pos)
      : false;
  return track.altitudeAgl > 500 && entry.boundaryTime < BOUNDARY_TIME_FILTER && willEnterAirspace; // && Number(track.groundSpeed) > AIRBORNE_GROUNDSPEED_FILTER;
};
