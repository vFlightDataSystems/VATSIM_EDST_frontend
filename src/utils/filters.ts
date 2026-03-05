import type { Feature, Polygon } from "geojson";
import type { ApiAircraftTrack } from "types/apiTypes/apiAircraftTrack";
import type { EdstEntry } from "types/edstEntry";
import { fetchRouteFixes } from "~/api/api";
import { formatRoute } from "~/utils/formatRoute";
import { routeWillEnterAirspace } from "~/utils/routeWillEnterAirspace";
import { locationToPosition } from "~/utils/locationToPosition";

const BOUNDARY_TIME_FILTER = 30; // minutes

export const aclFilter = async (entry: EdstEntry, track: ApiAircraftTrack, polygons: Feature<Polygon>[]) => {
  const currentRoute = formatRoute(entry.route);
  const currentRouteFixes = await fetchRouteFixes(currentRoute, entry.departure, entry.destination);
  const pos = locationToPosition(track.location);
  const willEnterAirspace = routeWillEnterAirspace(currentRoute, currentRouteFixes, polygons, pos);
  return entry.boundaryTime < BOUNDARY_TIME_FILTER && willEnterAirspace; // && Number(track.groundSpeed) > AIRBORNE_GROUNDSPEED_FILTER;
};
