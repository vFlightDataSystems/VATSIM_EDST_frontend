import {EdstEntryType} from "../../types";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import _ from "lodash";
import {fetchEdstEntries, fetchAarList} from "../../api";
import {refreshEntry} from "../refresh";
import {RootState} from "../store";
import {depFilter, entryFilter} from "../../filters";
import {addDepCid, deleteDepCid} from "./depSlice";
import {getClosestReferenceFix, processAar} from "../../lib";
import {addAclCid} from "./aclSlice";
import {point} from "@turf/turf";

export type EntriesStateType = {
  [cid: string]: EdstEntryType
};

const initialState = {};

export const refreshEntriesThunk: any = createAsyncThunk(
  'entries/entriesRefresh',
  async (_args: void, thunkAPI) => {
    let newEntries: EntriesStateType = {};
    let newEntryList: any[] = [];
    const state = thunkAPI.getState() as RootState;
    const {referenceFixes} = state.sectorData;
    await fetchEdstEntries()
      .then(response => response.json())
      .then((data: any[]) => newEntryList = data);
    for (let newEntry of newEntryList) {
      let currentEntry = _.assign({...state.entries[newEntry.cid]}, refreshEntry(newEntry, state));
      const {cidList: aclCidList, deletedList: aclDeletedList} = state.acl;
      const {cidList: depCidList, deletedList: depDeletedList} = state.dep;
      if (depFilter(currentEntry, state.sectorData.artccId) && !depDeletedList.includes(newEntry.cid)) {
        if (!depCidList.includes(newEntry.cid)) {
          thunkAPI.dispatch(addDepCid(newEntry.cid));
          if (currentEntry.aar_list === undefined) {
            await fetchAarList(state.sectorData.artccId, currentEntry.cid)
              .then(response => response.json())
              .then(aarList => {
                currentEntry.aar_list = aarList;
                currentEntry._aar_list = processAar(currentEntry, aarList);
              });
          }
        }
      } else {
        if (entryFilter(currentEntry, state.sectorData, state.acl.cidList)) {
          if (!aclCidList.includes(newEntry.cid) && !aclDeletedList.includes(newEntry.cid)) {
            // remove cid from departure list if will populate the aircraft list
            thunkAPI.dispatch(addAclCid(newEntry.cid));
            thunkAPI.dispatch(deleteDepCid(newEntry.cid));
            if (currentEntry.aar_list === undefined) {
              await fetchAarList(state.sectorData.artccId, currentEntry.cid)
                .then(response => response.json())
                .then(aarList => {
                  currentEntry.aar_list = aarList;
                  currentEntry._aar_list = processAar(currentEntry, aarList);
                });
            }
          }
          if (referenceFixes.length > 0) {
            currentEntry.reference_fix = getClosestReferenceFix(referenceFixes, point([newEntry.flightplan.lon, newEntry.flightplan.lat]));
          }
        }
      }
      newEntries[newEntry.cid] = currentEntry;
    }
    return new Promise<EntriesStateType>(function (resolve) {
      resolve(newEntries);
    });
  }
);

const entriesSlice = createSlice({
  name: 'entries',
  initialState: initialState as EntriesStateType,
  reducers: {
    updateEntry(state: EntriesStateType, action) {
      _.assign(state[action.payload.cid], action.payload.data);
    },
    setEntry(state: EntriesStateType, action: { payload: EdstEntryType }) {
      state[action.payload.cid] = action.payload;
    }
  },
  extraReducers: {
    [refreshEntriesThunk.fulfilled]: (state: any, action: { payload: EntriesStateType }) => {
      return {...state, ...action.payload};
    }
  }
});

export const {setEntry, updateEntry} = entriesSlice.actions;
export default entriesSlice.reducer;

export const entriesSelector = (state: RootState) => state.entries;
export const entrySelector = (cid: string) => (state: RootState) => state.entries[cid];
export const aselEntrySelector = (state: RootState) => state.app.asel ? state.entries[state.app.asel.cid] : null;