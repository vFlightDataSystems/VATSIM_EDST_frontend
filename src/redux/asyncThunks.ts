import {fetchFavData, fetchReferenceFixes, updateEdstEntry} from "../api";
import {RootState} from "./store";
import {setArtccId, setReferenceFixes, setSectorId, setSectors} from "./slices/sectorSlice";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {refreshEntriesThunk, setEntry} from "./slices/entriesSlice";
import {refreshEntry} from "./refresh";
import {removeDestFromRouteString} from "../lib";
import _ from "lodash";

export const initThunk = createAsyncThunk(
  'app/init',
  async (_args, thunkAPI) => {
    let sectorData = (thunkAPI.getState() as RootState).sectorData;
    let artccId: string;
    let sectorId: string;
    if (process.env.NODE_ENV === 'development') {
      artccId = 'zlc';
      // artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    } else {
      artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    }
    thunkAPI.dispatch(setArtccId(artccId));
    thunkAPI.dispatch(setSectorId(sectorId));
    if (Object.keys(sectorData.sectors).length === 0) {
      await fetchFavData(artccId)
        .then(response => response.json())
        .then(sectors => {
          thunkAPI.dispatch(setSectors(sectors));
        });
    }
    sectorData = (thunkAPI.getState() as RootState).sectorData;
    // if we have no reference fixes for computing FRD, get some
    if (!(sectorData.referenceFixes.length > 0)) {
      await fetchReferenceFixes(artccId)
        .then(response => response.json())
        .then(referenceFixes => {
          if (referenceFixes) {
            thunkAPI.dispatch(setReferenceFixes(referenceFixes));
          }
        });
    }
    return thunkAPI.dispatch(refreshEntriesThunk());
  }
);

export const amendEntryThunk = createAsyncThunk(
  'entries/amend',
  async ({cid, planData}: { cid: string, planData: any}, thunkAPI) => {
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
          updatedEntry.pending_removal = null;
          if (planData.scratch_hdg !== undefined) updatedEntry.scratch_hdg = planData.scratch_hdg;
          if (planData.scratch_spd !== undefined) updatedEntry.scratch_spd = planData.scratch_spd;
          thunkAPI.dispatch(setEntry(updatedEntry));
        }
      });
  }
);