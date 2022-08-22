import { distance, Feature, point, Polygon, Position } from "@turf/turf";
import { routeWillEnterAirspace } from "./lib";
import { ApiAircraftTrack } from "./types/apiTypes/apiAircraftTrack";
import { EdstEntry } from "./types/edstEntry";
import { fetchRouteFixes, memoizedFetchAirportInfo } from "./api/api";
import { formatRoute } from "./formatRoute";

const BOUNDARY_TIME_FILTER = 30; // minutes
const AIRBORNE_GROUNDSPEED_FILTER = 30; // knots

export const depFilter = async (entry: EdstEntry, track: ApiAircraftTrack, artccId: string) => {
  const depInfo = await memoizedFetchAirportInfo(entry.departure);
  let depAirportDistance = 0;
  if (depInfo) {
    const pos = [track.location.lon, track.location.lat];
    const depPos = [depInfo.lon, depInfo.lat];
    depAirportDistance = distance(point(depPos), point(pos), { units: "nauticalmiles" });
  }
  return Number(track.groundSpeed) < AIRBORNE_GROUNDSPEED_FILTER && depInfo?.artcc?.toUpperCase() === artccId && depAirportDistance < 20;
};

export const aclFilter = async (entry: EdstEntry, track: ApiAircraftTrack, polygons: Feature<Polygon>[]) => {
  const currentRoute = formatRoute(entry.route);
  const currentRouteFixes = await fetchRouteFixes(currentRoute, entry.departure, entry.destination);
  const pos: Position = [track.location.lon, track.location.lat];
  const willEnterAirspace = routeWillEnterAirspace(currentRoute, currentRouteFixes, polygons, pos);
  return track.altitudeAgl > 500 && entry.boundaryTime < BOUNDARY_TIME_FILTER && willEnterAirspace; // && Number(track.groundSpeed) > AIRBORNE_GROUNDSPEED_FILTER;
};
