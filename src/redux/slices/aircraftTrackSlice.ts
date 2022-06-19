import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AircraftTrack } from "../../types";
import { RootState } from "../store";

export type TracksState = Record<string, AircraftTrack & { lastUpdated: number }>;

const initialState: TracksState = {};

const aircraftTrackSlice = createSlice({
  name: "aircraftTracks",
  initialState,
  reducers: {
    setAircraftTrack(state, action: PayloadAction<AircraftTrack & { lastUpdated: number }>) {
      state[action.payload.aircraftId] = action.payload;
    }
  }
});

export const { setAircraftTrack } = aircraftTrackSlice.actions;
export default aircraftTrackSlice.reducer;

export const aircraftTracksSelector = (state: RootState) => state.aircraftTracks;
export const aircraftTrackSelector = (aircraftId: string) => (state: RootState) => state.aircraftTracks[aircraftId];
export const aselTrackSelector = (state: RootState) => (state.app.asel ? state.aircraftTracks[state.app.asel.aircraftId] : null);
