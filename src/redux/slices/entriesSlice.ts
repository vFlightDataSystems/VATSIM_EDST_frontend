import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { LocalEdstEntry } from "../../types";
import { RootState } from "../store";

export type EntriesState = Record<string, LocalEdstEntry>;

const initialState: EntriesState = {};

const entriesSlice = createSlice({
  name: "entries",
  initialState,
  reducers: {
    updateEntry(state, action: { payload: { aircraftId: string; data: Partial<LocalEdstEntry> } }) {
      _.assign(state[action.payload.aircraftId], action.payload.data);
    },
    setEntry(state, action: { payload: LocalEdstEntry }) {
      state[action.payload.aircraftId] = action.payload;
    },
    toggleSpa(state, action: { payload: string }) {
      state[action.payload].spa = !state[action.payload].spa;
    },
    deleteAclEntry(state, action: { payload: string }) {
      state[action.payload].aclDisplay = false;
      state[action.payload].aclDeleted = true;
    },
    addAclEntry(state, action: { payload: string }) {
      state[action.payload].aclDisplay = true;
      state[action.payload].aclDeleted = false;
    },
    deleteDepEntry(state, action: { payload: string }) {
      state[action.payload].depDisplay = false;
      state[action.payload].depDeleted = true;
    },
    addDepEntry(state, action: { payload: string }) {
      state[action.payload].depDisplay = true;
      state[action.payload].depDeleted = false;
    }
  }
});

export const { setEntry, updateEntry, toggleSpa, deleteAclEntry, deleteDepEntry, addAclEntry, addDepEntry } = entriesSlice.actions;
export default entriesSlice.reducer;

export const entriesSelector = (state: RootState) => state.entries;
export const entrySelector = (aircraftId: string) => (state: RootState) => state.entries[aircraftId];
export const aselEntrySelector = (state: RootState) => (state.app.asel ? state.entries[state.app.asel.aircraftId] : null);
