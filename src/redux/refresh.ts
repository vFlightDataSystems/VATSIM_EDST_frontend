import {EdstEntryType} from "../types";
import {RootState} from "./store";
import {
  computeBoundaryTime,
  getRemainingRouteData,
  getRouteDataDistance, processAar,
} from "../lib";
import _ from "lodash";
import {depFilter, entryFilter} from "../filters";

export const refreshEntry = (newEntry: EdstEntryType, state: RootState): EdstEntryType => {
  const {sectors, selectedSectors} = state.sectorData;
  const polygons = selectedSectors ? selectedSectors.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
  const pos: [number, number] = [newEntry.flightplan.lon, newEntry.flightplan.lat];
  let currentEntry: EdstEntryType | any = _.cloneDeep(state.entries[newEntry.cid]) ?? {
    vciStatus: -1,
    depStatus: -1,
    aclDisplay: false,
    aclDeleted: false,
    depDisplay: false,
    depDeleted: false
  };
  newEntry.boundary_time = computeBoundaryTime(newEntry, polygons);
  const routeFixNames = newEntry.route_data.map(fix => fix.name);
  const dest = newEntry.dest;
  // add departure airport to route_data if we know the coords to compute the distance
  if (newEntry.dest_info && !routeFixNames.includes(dest)) {
    newEntry.route_data.push({
      name: newEntry.dest_info.icao,
      pos: [Number(newEntry.dest_info.lon), Number(newEntry.dest_info.lat)]
    });
  }
  if (!(newEntry.route.slice(-dest.length) === dest)) {
    newEntry.route += newEntry.dest;
  }
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
    || !(entryFilter(newEntry, state.sectorData) || depFilter(newEntry, state.sectorData.artccId))) {
    newEntry.pending_removal = currentEntry.pending_removal ?? new Date().getTime();
  } else {
    newEntry.pending_removal = null;
  }
  if (newEntry.remarks.match(/\/v\//gi)) newEntry.voice_type = 'v';
  if (newEntry.remarks.match(/\/r\//gi)) newEntry.voice_type = 'r';
  if (newEntry.remarks.match(/\/t\//gi)) newEntry.voice_type = 't';
  return _.assign(currentEntry, newEntry);
};