import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store";

export enum MapFeatureOptionEnum {
  ultraLowSectors = "Ultra Low",
  lowSectors = "Low",
  highSectors = "High",
  ultraHighSectors = "Ultra High",
  centerBoundaries = "Center Boundaries",
  approachBoundaries = "Approach Control Boundaries",
  airport = "Airport",
  airportLabels = "Airport Labels",
  navaid = "NAVAIDS",
  navaidLabels = "NAVAID Labels",
  waypoint = "Waypoints",
  waypointLabels = "Waypoint Labels"
}

export enum AircraftDisplayOptionsEnum {
  aircraftListFilter = "Aircraft List Filter",
  altitudeFilterLimits = "Altitude Filter Limits",
  filterAbove = "filterAbove",
  filterBelow = "filterBelow",
  autoDataBlockOffset = "Auto Datablock Offset",
  mspLabels = "MSP/MEP Labels",
  routePreviewMinutes = "routePreviewMinutes"
}

export type MapFeatureOptionsType = { [key in MapFeatureOptionEnum]?: boolean }

export type aircraftDisplayOptionsType = {
  [AircraftDisplayOptionsEnum.aircraftListFilter]: boolean,
  [AircraftDisplayOptionsEnum.altitudeFilterLimits]: boolean,
  [AircraftDisplayOptionsEnum.filterAbove]: number | null,
  [AircraftDisplayOptionsEnum.filterBelow]: number | null,
  [AircraftDisplayOptionsEnum.autoDataBlockOffset]: boolean,
  [AircraftDisplayOptionsEnum.mspLabels]: boolean,
  [AircraftDisplayOptionsEnum.routePreviewMinutes]: number
}

export type GpdStateType = {
  mapFeatureOptions: MapFeatureOptionsType,
  aircraftDisplayOptions: aircraftDisplayOptionsType,
  displayCidList: string[]
};

const initialState: GpdStateType = {
  mapFeatureOptions: {},
  aircraftDisplayOptions: {
    [AircraftDisplayOptionsEnum.aircraftListFilter]: false,
    [AircraftDisplayOptionsEnum.altitudeFilterLimits]: false,
    [AircraftDisplayOptionsEnum.filterAbove]: null,
    [AircraftDisplayOptionsEnum.filterBelow]: null,
    [AircraftDisplayOptionsEnum.autoDataBlockOffset]: false,
    [AircraftDisplayOptionsEnum.mspLabels]: false,
    [AircraftDisplayOptionsEnum.routePreviewMinutes]: 0
  },
  displayCidList: []
};

const gpdSlice = createSlice({
  name: 'gpd',
  initialState: initialState as GpdStateType,
  reducers: {
    setGpdDisplayCidList(state, action: { payload: string[] }) {
      state.displayCidList = action.payload;
    },
    setMapFeatureOption(state, action: { payload: MapFeatureOptionsType }) {
      state.mapFeatureOptions = action.payload;
    },
    setAircraftDisplayOptions(state, action: { payload: aircraftDisplayOptionsType }) {
      state.aircraftDisplayOptions = action.payload;
    }
  }
});

export const {
  setGpdDisplayCidList,
  setMapFeatureOption,
  setAircraftDisplayOptions
} = gpdSlice.actions;
export default gpdSlice.reducer;

export const gpdCidListSelector = (state: RootState) => state.gpd.displayCidList;