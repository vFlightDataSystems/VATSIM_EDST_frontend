import {EdstEntryType} from "./types";
import {distance, Feature, point, Polygon, Properties} from "@turf/turf";
import {routeWillEnterAirspace} from "./lib";

export const depFilter = (entry: EdstEntryType, artccId: string) => {
  let depAirportDistance = 0;
  if (entry.dep_info) {
    const pos = [entry.flightplan.lon, entry.flightplan.lat];
    const depPos = [entry.dep_info.lon, entry.dep_info.lat];
    depAirportDistance = distance(point(depPos), point(pos), {units: 'nauticalmiles'});
  }
  return Number(entry.flightplan.ground_speed) < 40
    && entry.dep_info?.artcc?.toLowerCase() === artccId
    && depAirportDistance < 10;
};

export const entryFilter = (entry: EdstEntryType, polygons: Feature<Polygon, Properties>[]) => {
  const pos: [number, number] = [entry.flightplan.lon, entry.flightplan.lat];
  const willEnterAirspace = entry._route_data ? routeWillEnterAirspace(entry._route_data.slice(0), polygons, pos) : false;
  return ((entry.boundaryTime < 30 || entry.aclDisplay)
    && willEnterAirspace
    && Number(entry.flightplan.ground_speed) > 30);
};