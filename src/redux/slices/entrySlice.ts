import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { RootState } from "../store";
import { EdstEntry } from "../../types/edstEntry";
import { AircraftId } from "../../types/aircraftId";

type EntryState = Record<AircraftId, EdstEntry>;

const initialState: EntryState = {};

function entryUpdater(state: EntryState, aircraftId: AircraftId, data: Partial<EdstEntry>) {
  if (Object.keys(state).includes(aircraftId)) {
    state[aircraftId] = _.assign(state[aircraftId], data);
  }
}

const entrySlice = createSlice({
  name: "entry",
  initialState,
  reducers: {
    updateEntry(state, action: PayloadAction<{ aircraftId: AircraftId; data: Partial<EdstEntry> }>) {
      entryUpdater(state, action.payload.aircraftId, action.payload.data);
    },
    updateEntries(state, action: PayloadAction<Record<AircraftId, Partial<EdstEntry>>>) {
      Object.entries(action.payload).forEach(([aircraftId, data]) => {
        entryUpdater(state, aircraftId, data);
      });
    },
    setEntry(state, action: PayloadAction<EdstEntry>) {
      state[action.payload.aircraftId] = action.payload;
    },
    toggleSpa(state, action: PayloadAction<AircraftId>) {
      if (Object.keys(state).includes(action.payload)) {
        state[action.payload].spa = !state[action.payload].spa;
      }
    },
    rmvEntryFromAcl(state, action: PayloadAction<AircraftId>) {
      if (Object.keys(state).includes(action.payload)) {
        state[action.payload].aclDisplay = false;
        state[action.payload].aclDeleted = true;
      }
    },
    addEntryToAcl(state, action: PayloadAction<AircraftId>) {
      if (Object.keys(state).includes(action.payload)) {
        state[action.payload].aclDisplay = true;
        state[action.payload].aclDeleted = false;
      }
    },
    rmvEntryFromDep(state, action: PayloadAction<AircraftId>) {
      if (Object.keys(state).includes(action.payload)) {
        state[action.payload].depDisplay = false;
        state[action.payload].depDeleted = true;
      }
    },
    addEntryToDep(state, action: PayloadAction<AircraftId>) {
      if (Object.keys(state).includes(action.payload)) {
        state[action.payload].depDisplay = true;
        state[action.payload].depDeleted = false;
      }
    }
  }
});

export const { setEntry, updateEntry, toggleSpa, rmvEntryFromAcl, rmvEntryFromDep, addEntryToAcl, addEntryToDep, updateEntries } = entrySlice.actions;
export default entrySlice.reducer;

export const entriesSelector = (state: RootState) => state.entries;
export const entrySelector = (aircraftId: string) => (state: RootState) => state.entries[aircraftId];
export const aselEntrySelector = (state: RootState) => (state.app.asel ? state.entries[state.app.asel.aircraftId] : null);
