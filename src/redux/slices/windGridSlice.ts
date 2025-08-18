import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import type { Nullable } from "types/utility-types";
import type { RootState } from "~redux/store";
import type { Coordinate } from "types/gpd/coordinate";

export const WIND_GRID_MIN_ZOOM = 3000;
export const WIND_GRID_MAX_ZOOM = 12000;

const BOSCenter = [-71.00638888888889, 42.362944444444445] as Coordinate;

type WindGridConfiguration = Nullable<Record<string, unknown>>;

export type WindGridState = {
  windGridConfiguration: WindGridConfiguration;
  center: Coordinate;
  zoomLevel: number;
  temps: boolean;
  level: number;
  date: string;
  time: string;
};

export type SharedWindGridState = Omit<WindGridState, "center" | "zoomLevel">;

const initialState: WindGridState = {
  windGridConfiguration: null,
  center: BOSCenter,
  zoomLevel: 4000,
  temps: false,
  level: 300,
  date: null,
  time: null,
};

const windGridSlice = createSlice({
  name: "windGrid",
  initialState,
  reducers: {
    setWindGridState(state, action: PayloadAction<SharedWindGridState>) {
      _.assign(state, action.payload);
    },
    setWindGridCenter(state, action: PayloadAction<Coordinate>) {
      state.center = action.payload;
    },
    setWindGridZoomLevel(state, action: PayloadAction<number>) {
      if (action.payload >= WIND_GRID_MIN_ZOOM && action.payload <= WIND_GRID_MAX_ZOOM) {
        state.zoomLevel = action.payload;
      }
    },
    setWindGridFlightLevel(state, action: PayloadAction<number>) {
      state.level = action.payload;
    },
    setWindGridShowTemps(state, action: PayloadAction<boolean>) {
      state.temps = action.payload;
    },
    setWindGridDateTime(state, action: PayloadAction<{ date: string; time: string }>) {
      state.date = action.payload.date;
      state.time = action.payload.time;
    },
  },
});

export const { setWindGridState, setWindGridCenter, setWindGridZoomLevel, setWindGridFlightLevel, setWindGridShowTemps, setWindGridDateTime } = windGridSlice.actions;
export default windGridSlice.reducer;

export const windGridCenterSelector = (state: RootState) => state.windGrid.center;
export const windGridZoomLevelSelector = (state: RootState) => state.windGrid.zoomLevel;
export const windGridFlightLevelSelector = (state: RootState) => state.windGrid.level;
export const windGridShowTempsSelector = (state: RootState) => state.windGrid.temps;
export const windGridDateTimeSelector = (state: RootState) => ({
  date: state.windGrid.date,
  time: state.windGrid.time,
});
