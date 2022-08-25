import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { RootState } from "../store";
import { AircraftId } from "../../typeDefinitions/types/aircraftId";
import { AircraftTrack } from "../../typeDefinitions/types/aircraftTrack";

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
    }
  }
});

export const { setTrack, setTracks } = trackSlice.actions;
export default trackSlice.reducer;

export const aircraftTracksSelector = (state: RootState) => state.aircraftTracks;
export const aircraftTrackSelector = (aircraftId: AircraftId) => (state: RootState) => state.aircraftTracks[aircraftId];
export const aselTrackSelector = (state: RootState) => (state.app.asel ? state.aircraftTracks[state.app.asel.aircraftId] : null);
