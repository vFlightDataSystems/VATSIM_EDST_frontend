import {EdstEntryType} from "../types";
import {point} from "@turf/turf";
import {RootState} from "./store";
import {
  computeBoundaryTime,
  getClosestReferenceFix,
  getRemainingRouteData,
  getRouteDataDistance, processAar,
} from "../lib";
import _ from "lodash";
import {getAarData, getEdstData} from "../api";
import {addAclCid} from "./slices/aclSlice";
import {addDepCid, deleteDepCid} from "./slices/depSlice";
import {setEntry, updateEntry} from "./slices/entriesSlice";
import {depFilter, entryFilter} from "../filters";

export const refreshEntry = (new_entry: EdstEntryType, state: RootState) => {
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
    || !(entryFilter(new_entry, state) || depFilter(new_entry, state))) {
    new_entry.pending_removal = currentEntry.pending_removal ?? new Date().getTime();
  } else {
    new_entry.pending_removal = null;
  }
  if (new_entry.remarks.match(/\/v\//gi)) new_entry.voice_type = 'v';
  if (new_entry.remarks.match(/\/r\//gi)) new_entry.voice_type = 'r';
  if (new_entry.remarks.match(/\/t\//gi)) new_entry.voice_type = 't';
  return _.assign(currentEntry, new_entry);
};

export function refresh() {
  return async (dispatch: any, getState: () => RootState) => {
    const {referenceFixes} = getState().sectorData;
    getEdstData()
      .then(response => response.json())
      .then(newData => {
          if (newData) {
            for (let newEntry of newData) {
              let state = getState();
              let currentEntry: EdstEntryType = _.assign({reference_fix: null}, {...state.entries[newEntry.cid]}, refreshEntry(newEntry, state));
              dispatch(setEntry(currentEntry));
              const {cidList: aclCidList, deletedList: aclDeletedList} = state.acl;
              const {cidList: depCidList, deletedList: depDeletedList} = state.dep;
              if (depFilter(currentEntry, state) && !depDeletedList.includes(newEntry.cid)) {
                if (!depCidList.includes(newEntry.cid)) {
                  dispatch(addDepCid(newEntry.cid));
                }
                // dispatch(fetchAarData(currentEntry.cid));
              } else {
                if (entryFilter(currentEntry, state)) {
                  if (!aclCidList.includes(newEntry.cid) && !aclDeletedList.includes(newEntry.cid)) {
                    // remove cid from departure list if will populate the aircraft list
                    dispatch(addAclCid(newEntry.cid));
                    dispatch(deleteDepCid(newEntry.cid));
                  }
                  if (referenceFixes.length > 0) {
                    dispatch(updateEntry({
                      cid: newEntry.cid,
                      data: {reference_fix: getClosestReferenceFix(referenceFixes, point([newEntry.flightplan.lon, newEntry.flightplan.lat]))}
                    }));
                  }
                  // dispatch(fetchAarData(currentEntry.cid));
                }
              }
            }
          }
        }
      );
  };
}

export function fetchAarData(cid: string) {
  return (dispatch: any, getState: () => RootState) => {
    const {entries, sectorData} = getState();
    if (entries[cid]?.aar_list === undefined) {
      let aarList: any[] = [];
      getAarData(sectorData.artccId, cid)
        .then(response => response.json())
        .then(_aarList => {
          aarList = _aarList;
        });
      dispatch(updateEntry({cid: cid, data: {aar_list: aarList, _aar_list: processAar(entries[cid], aarList)}}));
    }
  };
}
