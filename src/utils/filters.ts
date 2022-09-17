import { distance, Feature, point, Polygon } from "@turf/turf";
import { ApiAircraftTrack } from "../typeDefinitions/types/apiTypes/apiAircraftTrack";
import { EdstEntry } from "../typeDefinitions/types/edstEntry";
import { fetchRouteFixes, memoizedFetchAirportInfo } from "../api/api";
import { formatRoute } from "./formatRoute";
import { routeWillEnterAirspace } from "./routeWillEnterAirspace";
import { locationToPosition } from "./locationToPosition";

const BOUNDARY_TIME_FILTER = 30; // minutes
const AIRBORNE_GROUNDSPEED_FILTER = 30; // knots

export const depFilter = async (entry: EdstEntry, track: ApiAircraftTrack, artccId: string) => {
  const depInfo = await memoizedFetchAirportInfo(entry.departure);
  let depAirportDistance = 0;
  if (depInfo) {
    const pos = locationToPosition(track.location);
    const depPos = [depInfo.lon, depInfo.lat];
    depAirportDistance = distance(point(depPos), point(pos), { units: "nauticalmiles" });
  }
  return Number(track.groundSpeed) < AIRBORNE_GROUNDSPEED_FILTER && depInfo?.artcc?.toUpperCase() === artccId && depAirportDistance < 20;
};

export const aclFilter = async (entry: EdstEntry, track: ApiAircraftTrack, polygons: Feature<Polygon>[]) => {
  const currentRoute = formatRoute(entry.route);
  const currentRouteFixes = await fetchRouteFixes(currentRoute, entry.departure, entry.destination);
  const pos = locationToPosition(track.location);
  const willEnterAirspace = routeWillEnterAirspace(currentRoute, currentRouteFixes, polygons, pos);
  return track.altitudeAgl > 500 && entry.boundaryTime < BOUNDARY_TIME_FILTER && willEnterAirspace; // && Number(track.groundSpeed) > AIRBORNE_GROUNDSPEED_FILTER;
};
