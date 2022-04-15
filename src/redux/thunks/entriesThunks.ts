import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {removeDestFromRouteString} from "../../lib";
import {updateEdstEntry} from "../../api";
import {refreshEntry} from "../refresh";
import _ from "lodash";
import {addAclEntry, addDepEntry, setEntry} from "../slices/entriesSlice";
import {aclRowFieldEnum, depRowFieldEnum, windowEnum} from "../../enums";
import {setAsel} from "../slices/appSlice";

export const amendEntryThunk = createAsyncThunk(
  'entries/amend',
  async ({cid, planData}: { cid: string, planData: Record<string, any> }, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const {sectors, selectedSectors, artccId} = state.sectorData;
    const polygons = selectedSectors ? selectedSectors.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
    let currentEntry = state.entries[cid];
    if (Object.keys(planData).includes('altitude')) {
      planData.interim = null;
    }
    if (Object.keys(planData).includes('route')) {
      const dest = currentEntry.dest;
      planData.route = removeDestFromRouteString(planData.route.slice(0), dest);
      planData.previous_route = currentEntry.depDisplay ? currentEntry.route : currentEntry._route;
      planData.previous_route_data = currentEntry.depDisplay ? currentEntry.route_data : currentEntry._route_data;
    }
    planData.callsign = currentEntry.callsign;
    return updateEdstEntry(planData)
      .then(response => response.json())
      .then(updatedEntry => {
        if (updatedEntry) {
          updatedEntry = refreshEntry(updatedEntry, polygons, artccId, _.cloneDeep(currentEntry));
          updatedEntry.pendingRemoval = null;
          if (planData.scratchHdg !== undefined) updatedEntry.scratchHdg = planData.scratchHdg;
          if (planData.scratchSpd !== undefined) updatedEntry.scratchSpd = planData.scratchSpd;
          thunkAPI.dispatch(setEntry(updatedEntry));
        }
      });
  }
);

function addEntryThunk(fid: string, window: windowEnum) {
  return (dispatch: any, getState: () => RootState) => {
    const entries = getState().entries;
    let cid = Object.values(entries ?? {})?.find(e => String(e?.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid)?.cid;
    if (cid) {
      switch (window) {
        case windowEnum.acl:
          dispatch(addAclEntry(cid));
          dispatch(setAsel({cid: cid, field: aclRowFieldEnum.fid, window: windowEnum.acl}));
          break;
        case windowEnum.dep:
          dispatch(addDepEntry(cid));
          dispatch(setAsel({cid: cid, field: depRowFieldEnum.fid, window: windowEnum.dep}));
          break;
        default:
          break;
      }
    }
  };
}

export function addAclEntryByFid(fid: string) {
  return addEntryThunk(fid, windowEnum.acl);
}

export function addDepEntryByFid(fid: string) {
  return addEntryThunk(fid, windowEnum.dep);
}
