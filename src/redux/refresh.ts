import _ from "lodash";
import { Feature, Polygon, Position } from "@turf/turf";
import { EdstEntry, LocalEdstEntry, LocalVEdstEntry } from "../types";
import { computeBoundaryTime, getRemainingRouteData, getRouteDataDistance, processAar, removeDestFromRouteString } from "../lib";
import { depFilter, entryFilter } from "../filters";

export function refreshEntry(
  newEntry: EdstEntry & Partial<LocalVEdstEntry>,
  polygons: Feature<Polygon>[],
  artccId: string,
  currentEntry: Partial<LocalEdstEntry>
): LocalEdstEntry {
  const pos: Position = [newEntry.flightplan.lon, newEntry.flightplan.lat];
  newEntry.boundaryTime = computeBoundaryTime(newEntry, polygons);
  const routeFixNames = newEntry.route_data.map(fix => fix.name);
  const { dest } = newEntry;
  // add departure airport to route_data if we know the coords to compute the distance
  if (newEntry.dest_info && !routeFixNames.includes(dest)) {
    newEntry.route_data.push({
      name: newEntry.dest_info.icao,
      pos: [Number(newEntry.dest_info.lon), Number(newEntry.dest_info.lat)]
    });
  }
  newEntry.route = removeDestFromRouteString(newEntry.route.slice(0), newEntry.dest);
  if (currentEntry.route_data === newEntry.route_data && currentEntry.currentRoute_data) {
    // if route_data has not changed
    newEntry.currentRoute_data = getRouteDataDistance(currentEntry.currentRoute_data, pos);
    // // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
    // if (currentEntry.aarList?.length) {
    //   newEntry._aarList = processAar(currentEntry, currentEntry.aarList);
    // }
  } else {
    // if route_data has changed
    if (newEntry.route_data) {
      newEntry.currentRoute_data = getRouteDataDistance(newEntry.route_data, pos);
    }
    // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
    if (currentEntry.aarList) {
      newEntry.currentAarList = processAar(currentEntry, currentEntry.aarList);
    }
  }
  if (newEntry.currentRoute_data) {
    _.assign(newEntry, getRemainingRouteData(newEntry.route, newEntry.currentRoute_data.slice(0), pos, dest, polygons));
  }
  if (
    newEntry.update_time === currentEntry.update_time ||
    ((newEntry.currentRoute_data?.[-1]?.dist ?? Infinity) < 15 && newEntry.dest_info) ||
    !(entryFilter(newEntry, polygons) || depFilter(newEntry, artccId))
  ) {
    newEntry.pendingRemoval = currentEntry.pendingRemoval ?? new Date().getTime();
  } else {
    newEntry.pendingRemoval = null;
  }
  if (newEntry.remarks.match(/\/v\//gi)) newEntry.voiceType = "v";
  if (newEntry.remarks.match(/\/r\//gi)) newEntry.voiceType = "r";
  if (newEntry.remarks.match(/\/t\//gi)) newEntry.voiceType = "t";
  return _.assign(currentEntry, newEntry) as LocalEdstEntry;
}
