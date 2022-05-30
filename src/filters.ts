import { distance, Feature, point, Polygon, Position } from "@turf/turf";
import { EdstEntry, LocalEdstEntry } from "./types";
import { routeWillEnterAirspace } from "./lib";

const BOUNDARY_TIME_FILTER = 30; // minutes
const AIRBORNE_GROUNDSPEED_FILTER = 30; // knots

export const depFilter = (entry: EdstEntry, artccId: string) => {
  let depAirportDistance = 0;
  if (entry.dep_info) {
    const pos = [entry.flightplan.lon, entry.flightplan.lat];
    const depPos = [entry.dep_info.lon, entry.dep_info.lat];
    depAirportDistance = distance(point(depPos), point(pos), { units: "nauticalmiles" });
  }
  return (
    Number(entry.flightplan.ground_speed) < AIRBORNE_GROUNDSPEED_FILTER && entry.dep_info?.artcc?.toLowerCase() === artccId && depAirportDistance < 10
  );
};

export const entryFilter = (entry: Partial<LocalEdstEntry>, polygons: Feature<Polygon>[]) => {
  const pos: Position = [entry.flightplan.lon, entry.flightplan.lat];
  const willEnterAirspace =
    entry.currentRouteData && entry.currentRoute ? routeWillEnterAirspace(entry.currentRoute, entry.currentRouteData.slice(0), polygons, pos) : false;
  return (
    (entry.boundaryTime ?? Infinity) < BOUNDARY_TIME_FILTER &&
    willEnterAirspace &&
    Number(entry.flightplan.ground_speed) > AIRBORNE_GROUNDSPEED_FILTER
  );
};
