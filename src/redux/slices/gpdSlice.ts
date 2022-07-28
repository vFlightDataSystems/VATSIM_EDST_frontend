import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export enum SectorType {
  ultraLow = "UL",
  low = "L",
  high = "H",
  ultraHigh = "UH",
  lowHigh = "LH"
}

export enum mapFeatureOption {
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
  waypointLabels = "Waypoint Labels"
}

export type MapFeatureOptions = Partial<Record<mapFeatureOption, boolean>>;

export type AircraftDisplayOptions = {
  aircraftListFilter: ["Aircraft List Filter", boolean];
  altitudeFilterLimits: ["Altitude Filter Limits", boolean];
  filterAbove: ["Filter Above", number | null];
  filterBelow: ["Filter Below", number | null];
  autoDatablockOffset: ["Auto Datablock Offset", boolean];
  mspLabels: ["MSP/MEP Labels", boolean];
  routePreviewMinutes: ["Route Preview (minutes)", number];
};

type GpdConfiguration = Record<string, unknown> | null;

export type GpdState = {
  gpdConfiguration: GpdConfiguration;
  mapFeatureOptions: MapFeatureOptions;
  aircraftDisplayOptions: AircraftDisplayOptions;
  suppressed: boolean;
  planData: Record<string, unknown>[];
};

const initialMapFeatureOptionsState = {
  [mapFeatureOption.lowSectors]: true,
  [mapFeatureOption.highSectors]: true
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
    routePreviewMinutes: ["Route Preview (minutes)", 0]
  },
  suppressed: false,
  planData: []
};

const gpdSlice = createSlice({
  name: "gpd",
  initialState,
  reducers: {
    addGpdPlanData(state, action: PayloadAction<Record<string, unknown>>) {
      state.planData.push(action.payload);
    },
    removeGpdPlanData(state, action: PayloadAction<number>) {
      if (action.payload < state.planData.length - 1 && action.payload >= 0) {
        state.planData.splice(action.payload);
      }
    },
    setMapFeatureOptions(state, action: PayloadAction<MapFeatureOptions>) {
      state.mapFeatureOptions = action.payload;
    },
    setAircraftDisplayOptions(state, action: PayloadAction<AircraftDisplayOptions>) {
      state.aircraftDisplayOptions = action.payload;
    },
    setSuppressed(state, action: PayloadAction<boolean>) {
      state.suppressed = action.payload;
    },
    toggleSuppressed(state) {
      state.suppressed = !state.suppressed;
    }
  }
});

export const {
  addGpdPlanData,
  removeGpdPlanData,
  setMapFeatureOptions,
  setAircraftDisplayOptions,
  setSuppressed,
  toggleSuppressed
} = gpdSlice.actions;
export default gpdSlice.reducer;

export const gpdMapFeatureOptionsSelector = (state: RootState) => state.gpd.mapFeatureOptions;
export const gpdSuppressedSelector = (state: RootState) => state.gpd.suppressed;
export const gpdAircraftDisplayOptionsSelector = (state: RootState) => state.gpd.aircraftDisplayOptions;
export const gpdPlanDataSelector = (state: RootState) => state.gpd.planData;
