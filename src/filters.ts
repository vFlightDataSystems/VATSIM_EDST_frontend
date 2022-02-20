import {EdstEntryType} from "./types";
import {distance, point} from "@turf/turf";
import {routeWillEnterAirspace} from "./lib";
import {SectorDataStateType} from "./redux/slices/sectorSlice";

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

export const entryFilter = (entry: EdstEntryType, sectorData: SectorDataStateType) => {
  const {sectors, selectedSectors} = sectorData;
  const polygons = selectedSectors ? selectedSectors.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
  const pos: [number, number] = [entry.flightplan.lon, entry.flightplan.lat];
  const willEnterAirspace = entry._route_data ? routeWillEnterAirspace(entry._route_data.slice(0), polygons, pos) : false;
  return ((entry.boundary_time < 30 || entry.aclDisplay)
    && willEnterAirspace
    && Number(entry.flightplan.ground_speed) > 30);
};