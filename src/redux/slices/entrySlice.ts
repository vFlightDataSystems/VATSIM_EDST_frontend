import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import type { EdstEntry } from "types/edstEntry";
import type { AircraftId } from "types/aircraftId";
import type { RootState } from "~redux/store";
import sharedSocket from "~socket";

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
    updateEntry(
      state,
      action: PayloadAction<{
        aircraftId: AircraftId;
        data: Partial<EdstEntry>;
      }>
    ) {
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
      delete state[action.payload];
    },
  },
});

export const { setEntry, updateEntry, delEntry, toggleSpa, updateEntries } = entrySlice.actions;
export default entrySlice.reducer;

export const entriesSelector = (state: RootState) => state.entries;
export const entrySelector = (state: RootState, aircraftId: AircraftId) => state.entries[aircraftId];
export const aselEntrySelector = (state: RootState) => (state.app.asel ? state.entries[state.app.asel.aircraftId] : null);
