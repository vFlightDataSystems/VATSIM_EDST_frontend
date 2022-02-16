import {EdstEntryType} from "../types";
import {RootState} from "./store";
import {
  computeBoundaryTime,
  getRemainingRouteData,
  getRouteDataDistance, processAar,
} from "../lib";
import _ from "lodash";
import {depFilter, entryFilter} from "../filters";

export const refreshEntry = (new_entry: EdstEntryType, state: RootState): EdstEntryType => {
  const {sectors, selectedSectors} = state.sectorData;
  const polygons = selectedSectors ? selectedSectors.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
  const pos: [number, number] = [new_entry.flightplan.lon, new_entry.flightplan.lat];
  let currentEntry: EdstEntryType | any = _.cloneDeep(state.entries[new_entry.cid]) ?? {
    vciStatus: -1,
    depStatus: -1
  };
  new_entry.boundary_time = computeBoundaryTime(new_entry, polygons);
  const routeFixNames = new_entry.route_data.map(fix => fix.name);
  const dest = new_entry.dest;
  // add departure airport to route_data if we know the coords to compute the distance
  if (new_entry.dest_info && !routeFixNames.includes(dest)) {
    new_entry.route_data.push({
      name: new_entry.dest_info.icao,
      pos: [Number(new_entry.dest_info.lon), Number(new_entry.dest_info.lat)]
    });
  }
  if (!(new_entry.route.slice(-dest.length) === dest)) {
    new_entry.route += new_entry.dest;
  }
  if (currentEntry.route_data === new_entry.route_data) { // if route_data has not changed
    new_entry._route_data = getRouteDataDistance(currentEntry._route_data, pos);
    // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
    if (currentEntry.aar_list.length) {
      new_entry._aar_list = processAar(currentEntry, currentEntry.aar_list);
    }
  } else {
    if (new_entry.route_data) {
      new_entry._route_data = getRouteDataDistance(new_entry.route_data, pos);
    }
    // recompute aar (aircraft might have passed a tfix, so the AAR doesn't apply anymore)
    if (currentEntry.aar_list) {
      new_entry._aar_list = processAar(currentEntry, currentEntry.aar_list);
    }
  }
  if (new_entry._route_data) {
    _.assign(new_entry, getRemainingRouteData(new_entry.route, new_entry._route_data.slice(0), pos));
  }
  if (new_entry.update_time === currentEntry.update_time
    || (currentEntry._route_data?.[-1]?.dist < 15 && new_entry.dest_info)
    || !(entryFilter(new_entry, state.sectorData, state.acl.cidList) || depFilter(new_entry, state.sectorData.artccId))) {
    new_entry.pending_removal = currentEntry.pending_removal ?? new Date().getTime();
  } else {
    new_entry.pending_removal = null;
  }
  if (new_entry.remarks.match(/\/v\//gi)) new_entry.voice_type = 'v';
  if (new_entry.remarks.match(/\/r\//gi)) new_entry.voice_type = 'r';
  if (new_entry.remarks.match(/\/t\//gi)) new_entry.voice_type = 't';
  return _.assign(currentEntry, new_entry);
};