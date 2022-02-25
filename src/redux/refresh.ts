import {EdstEntryType} from "../types";
import {
  computeBoundaryTime,
  getRemainingRouteData,
  getRouteDataDistance, processAar, removeDestFromRouteString,
} from "../lib";
import _ from "lodash";
import {depFilter, entryFilter} from "../filters";
import {Feature, Polygon} from "@turf/turf";

const currentEntryFallbackValue = {
  vciStatus: -1,
  depStatus: -1,
  aclDisplay: false,
  aclDeleted: false,
  depDisplay: false,
  depDeleted: false
};

export function refreshEntry(newEntry: EdstEntryType, polygons: Feature<Polygon>[], artccId: string, currentEntry: EdstEntryType | any): EdstEntryType {
  if (!currentEntry) {
    currentEntry = currentEntryFallbackValue;
  }
  const pos: [number, number] = [newEntry.flightplan.lon, newEntry.flightplan.lat];
  newEntry.boundaryTime = computeBoundaryTime(newEntry, polygons);
  const routeFixNames = newEntry.route_data.map(fix => fix.name);
  const dest = newEntry.dest;
  // add departure airport to route_data if we know the coords to compute the distance
  if (newEntry.dest_info && !routeFixNames.includes(dest)) {
    newEntry.route_data.push({
      name: newEntry.dest_info.icao,
      pos: [Number(newEntry.dest_info.lon), Number(newEntry.dest_info.lat)]
    });
  }
  newEntry.route = removeDestFromRouteString(newEntry.route.slice(0), newEntry.dest);
  if (currentEntry.route_data === newEntry.route_data) { // if route_data has not changed
    newEntry._route_data = getRouteDataDistance(currentEntry._route_data, pos);
    // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
    if (currentEntry.aar_list.length) {
      newEntry._aar_list = processAar(currentEntry, currentEntry.aar_list);
    }
  } else {
    if (newEntry.route_data) {
      newEntry._route_data = getRouteDataDistance(newEntry.route_data, pos);
    }
    // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
    if (currentEntry.aar_list) {
      newEntry._aar_list = processAar(currentEntry, currentEntry.aar_list);
    }
  }
  if (newEntry._route_data) {
    _.assign(newEntry, getRemainingRouteData(newEntry.route, newEntry._route_data.slice(0), pos));
  }
  if (newEntry.update_time === currentEntry.update_time
    || (currentEntry._route_data?.[-1]?.dist < 15 && newEntry.dest_info)
    || !(entryFilter(newEntry, polygons) || depFilter(newEntry, artccId))) {
    newEntry.pending_removal = currentEntry.pending_removal ?? new Date().getTime();
  } else {
    newEntry.pending_removal = null;
  }
  if (newEntry.remarks.match(/\/v\//gi)) newEntry.voiceType = 'v';
  if (newEntry.remarks.match(/\/r\//gi)) newEntry.voiceType = 'r';
  if (newEntry.remarks.match(/\/t\//gi)) newEntry.voiceType = 't';
  return _.assign(currentEntry, newEntry);
}
