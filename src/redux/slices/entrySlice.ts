import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { RootState } from "../store";
import { EdstEntry } from "../../types/edstEntry";
import { AircraftId } from "../../types/aircraftId";

type EntryState = Record<AircraftId, EdstEntry>;

const initialState: EntryState = {};

const entrySlice = createSlice({
  name: "entry",
  initialState,
  reducers: {
    updateEntry(state, action: PayloadAction<{ aircraftId: AircraftId; data: Partial<EdstEntry> }>) {
      _.assign(state[action.payload.aircraftId], action.payload.data);
    },
    setEntry(state, action: PayloadAction<EdstEntry>) {
      state[action.payload.aircraftId] = action.payload;
    },
    toggleSpa(state, action: PayloadAction<AircraftId>) {
      state[action.payload].spa = !state[action.payload].spa;
    },
    deleteAclEntry(state, action: PayloadAction<AircraftId>) {
      state[action.payload].aclDisplay = false;
      state[action.payload].aclDeleted = true;
    },
    addAclEntry(state, action: PayloadAction<AircraftId>) {
      state[action.payload].aclDisplay = true;
      state[action.payload].aclDeleted = false;
    },
    deleteDepEntry(state, action: PayloadAction<AircraftId>) {
      state[action.payload].depDisplay = false;
      state[action.payload].depDeleted = true;
    },
    addDepEntry(state, action: PayloadAction<AircraftId>) {
      state[action.payload].depDisplay = true;
      state[action.payload].depDeleted = false;
    },
    updateEntries(state, action: PayloadAction<Record<AircraftId, Partial<EdstEntry>>>) {
      const aircraftIdList = Object.keys(state);
      // eslint-disable-next-line no-restricted-syntax
      for (const [aircraftId, data] of Object.keys(action.payload)) {
        if (aircraftIdList.includes(aircraftId)) {
          _.assign(state[aircraftId], data);
        }
      }
    }
  }
});

export const { setEntry, updateEntry, toggleSpa, deleteAclEntry, deleteDepEntry, addAclEntry, addDepEntry, updateEntries } = entrySlice.actions;
export default entrySlice.reducer;

export const entriesSelector = (state: RootState) => state.entries;
export const entrySelector = (aircraftId: string) => (state: RootState) => state.entries[aircraftId];
export const aselEntrySelector = (state: RootState) => (state.app.asel ? state.entries[state.app.asel.aircraftId] : null);
