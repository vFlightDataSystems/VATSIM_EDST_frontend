import {EdstEntryType} from "../../types";
import {createSlice} from "@reduxjs/toolkit";
import _ from "lodash";

export type EntriesStateType = {
  [cid: string]: EdstEntryType
};

const initialState = {};

const entriesSlice = createSlice({
  name: 'entries',
  initialState: initialState as EntriesStateType,
  reducers: {
    updateEntry(state: EntriesStateType, action) {
      _.assign(state[action.payload.cid], action.payload.data);
    },
    setEntry(state: EntriesStateType, action) {
      state[action.payload.cid] = action.payload;
    }
  }
});

export const {setEntry, updateEntry} = entriesSlice.actions;
export default entriesSlice.reducer;