import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import type { AircraftId } from "types/aircraftId";
import type { AircraftTrack } from "types/aircraftTrack";
import type { RootState } from "~redux/store";

type TrackState = Record<AircraftId, AircraftTrack>;

const initialState: TrackState = {};

const trackSlice = createSlice({
  name: "track",
  initialState,
  reducers: {
    setTrack(state, action: PayloadAction<AircraftTrack>) {
      state[action.payload.aircraftId] = action.payload;
    },
    setTracks(state, action: PayloadAction<Record<AircraftId, AircraftTrack>>) {
      _.assign(state, action.payload);
    },
  },
});

export const { setTrack, setTracks } = trackSlice.actions;
export default trackSlice.reducer;

export const aircraftTracksSelector = (state: RootState) => state.aircraftTracks;
export const aircraftTrackSelector = (state: RootState, aircraftId: AircraftId) => state.aircraftTracks[aircraftId];
export const aselTrackSelector = (state: RootState) => (state.app.asel ? state.aircraftTracks[state.app.asel.aircraftId] : null);
