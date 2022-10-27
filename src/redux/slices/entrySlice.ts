import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { RootState } from "../store";
import { EdstEntry } from "../../typeDefinitions/types/edstEntry";
import { AircraftId } from "../../typeDefinitions/types/aircraftId";
import sharedSocket from "../../sharedState/socket";

type EntryState = Record<AircraftId, EdstEntry>;

const initialState: EntryState = {};

function entryUpdater(state: EntryState, aircraftId: AircraftId, data: Partial<EdstEntry>) {
  if (Object.keys(state).includes(aircraftId)) {
    state[aircraftId] = _.assign(state[aircraftId], data);
    sharedSocket.updateSharedAircraft(state[aircraftId]);
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
        sharedSocket.updateSharedAircraft(state[action.payload]);
      }
    },
    delEntry(state, action: PayloadAction<AircraftId>) {
      entryUpdater(state, action.payload, { deleted: true });
    }
  }
});

export const { setEntry, updateEntry, delEntry, toggleSpa, updateEntries } = entrySlice.actions;
export default entrySlice.reducer;

export const entriesSelector = (state: RootState) => state.entries;
export const entrySelector = (state: RootState, aircraftId: AircraftId) => state.entries[aircraftId];
export const aselEntrySelector = (state: RootState) => (state.app.asel ? state.entries[state.app.asel.aircraftId] : null);
