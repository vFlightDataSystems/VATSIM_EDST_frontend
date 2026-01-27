import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import type { Nullable } from "types/utility-types";
import type { RootState } from "~redux/store";
import sharedSocket from "~socket";
import { Coordinate } from "types/gpd/coordinate";
import { getCenterCoordinates } from "~/utils/getArtccCenter";
import { artccIdSelector } from "./sectorSlice";

export const GPD_MIN_ZOOM = 3000;
export const GPD_MAX_ZOOM = 12000;
export const USA_CENTER: Coordinate = [44.9672, -103.7715];

export enum SectorType {
  ultraLow = "UL",
  low = "L",
  high = "H",
  ultraHigh = "UH",
  lowHigh = "LH",
}

export enum MapFeatureOption {
  ultraLowSectors = "Ultra Low",
  lowSectors = "Low",
  highSectors = "High",
  ultraHighSectors = "Ultra High",
  centerBoundaries = "Center Boundaries",
  approachBoundaries = "Approach Control Boundaries",
  airport = "Airport",
  airportLabels = "Airport Labels",
  Jairways = "J Airways",
  Qairways = "Q Airways",
  Vairways = "V Airways",
  Tairways = "T Airways",
  navaid = "NAVAIDS",
  navaidLabels = "NAVAID Labels",
  waypoint = "Waypoints",
  waypointLabels = "Waypoint Labels",
}

export type MapFeatureOptions = Partial<Record<MapFeatureOption, boolean>>;

export type AircraftDisplayOptions = {
  aircraftListFilter: ["Aircraft List Filter", boolean];
  altitudeFilterLimits: ["Altitude Filter Limits", boolean];
  filterAbove: ["Filter Above", Nullable<number>];
  filterBelow: ["Filter Below", Nullable<number>];
  autoDatablockOffset: ["Auto Datablock Offset", boolean];
  mspLabels: ["MSP/MEP Labels", boolean];
  routePreviewMinutes: ["Route Preview (minutes)", number];
};

type GpdConfiguration = Nullable<Record<string, unknown>>;

export type GpdState = {
  gpdConfiguration: GpdConfiguration;
  mapFeatureOptions: MapFeatureOptions;
  aircraftDisplayOptions: AircraftDisplayOptions;
  center: Coordinate;
  zoomLevel: number;
  suppressed: boolean;
  planData: Record<string, unknown>[];
};

export type SharedGpdState = Omit<GpdState, "center" | "zoomLevel">;

const initialMapFeatureOptionsState = {
  [MapFeatureOption.lowSectors]: true,
  [MapFeatureOption.highSectors]: true,
};

const initialState: GpdState = {
  mapFeatureOptions: initialMapFeatureOptionsState,
  gpdConfiguration: null,
  aircraftDisplayOptions: {
    aircraftListFilter: ["Aircraft List Filter", false],
    altitudeFilterLimits: ["Altitude Filter Limits", false],
    filterAbove: ["Filter Above", null],
    filterBelow: ["Filter Below", null],
    autoDatablockOffset: ["Auto Datablock Offset", false],
    mspLabels: ["MSP/MEP Labels", false],
    routePreviewMinutes: ["Route Preview (minutes)", 0],
  },
  center: USA_CENTER,
  zoomLevel: 4000,
  suppressed: false,
  planData: [],
};

export const initializeGpdCenter = createAsyncThunk("gpd/initializeCenter", async (_, { getState, dispatch }) => {
  const state = getState() as RootState;
  const artccId = artccIdSelector(state);
  if (artccId) {
    const centerCoord = [getCenterCoordinates(artccId)?.lon, getCenterCoordinates(artccId)?.lat] as Coordinate;
    dispatch(setGpdCenter(centerCoord));
  }
});

const gpdSlice = createSlice({
  name: "gpd",
  initialState,
  reducers: {
    setGpdState(state, action: PayloadAction<SharedGpdState>) {
      _.assign(state, action.payload);
    },
    addGpdPlanData(state, action: PayloadAction<Record<string, unknown>>) {
      state.planData.push(action.payload);
      sharedSocket.setGpdState(state);
    },
    removeGpdPlanData(state, action: PayloadAction<number>) {
      if (action.payload < state.planData.length - 1 && action.payload >= 0) {
        state.planData.splice(action.payload);
      }
      sharedSocket.setGpdState(state);
    },
    setGpdMapFeatureOptions(state, action: PayloadAction<MapFeatureOptions>) {
      state.mapFeatureOptions = action.payload;
      sharedSocket.setGpdState(state);
    },
    setGpdAircraftDisplayOptions(state, action: PayloadAction<AircraftDisplayOptions>) {
      state.aircraftDisplayOptions = action.payload;
      sharedSocket.setGpdState(state);
    },
    setGpdSuppressed(state, action: PayloadAction<boolean>) {
      state.suppressed = action.payload;
      sharedSocket.setGpdState(state);
    },
    toggleGpdSuppressed(state) {
      state.suppressed = !state.suppressed;
      sharedSocket.setGpdState(state);
    },
    setGpdCenter(state, action: PayloadAction<Coordinate>) {
      state.center = action.payload;
      sharedSocket.setGpdState(state);
    },
    setGpdZoomLevel(state, action: PayloadAction<number>) {
      if (action.payload >= GPD_MIN_ZOOM && action.payload <= GPD_MAX_ZOOM) {
        state.zoomLevel = action.payload;
        // sharedSocket.setGpdState(state);
      }
    },
  },
});

export const {
  setGpdState,
  addGpdPlanData,
  removeGpdPlanData,
  setGpdMapFeatureOptions,
  setGpdAircraftDisplayOptions,
  setGpdSuppressed,
  toggleGpdSuppressed,
  setGpdCenter,
  setGpdZoomLevel,
} = gpdSlice.actions;
export default gpdSlice.reducer;

export const gpdMapFeatureOptionsSelector = (state: RootState) => state.gpd.mapFeatureOptions;
export const gpdSuppressedSelector = (state: RootState) => state.gpd.suppressed;
export const gpdAircraftDisplayOptionsSelector = (state: RootState) => state.gpd.aircraftDisplayOptions;
export const gpdPlanDataSelector = (state: RootState) => state.gpd.planData;
export const gpdCenterSelector = (state: RootState) => state.gpd.center;
export const gpdZoomLevelSelector = (state: RootState) => state.gpd.zoomLevel;
