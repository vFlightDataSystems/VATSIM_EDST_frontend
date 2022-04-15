import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {AirwaySegmentType, FixType} from "../../types";

export enum SectorTypeEnum {
  ultraLow = "UL",
  low = "L",
  high = "H",
  ultraHigh = "UH",
  lowHigh = "LH"
}

export enum MapFeatureOptionEnum {
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
  sectorTypes: Record<string,SectorTypeEnum>,
  navaids: FixType[],
  waypoints: FixType[],
  airways: Record<string,AirwaySegmentType[]>,
  displayData: any
};

const initialMapFeatureOptionsState = {
  [MapFeatureOptionEnum.lowSectors]: true,
  [MapFeatureOptionEnum.highSectors]: true
}

const initialState: GpdStateType = {
  mapFeatureOptions: initialMapFeatureOptionsState,
  sectorTypes: {},
  navaids: [],
  waypoints: [],
  airways: {},
  aircraftDisplayOptions: {
    [AircraftDisplayOptionsEnum.aircraftListFilter]: false,
    [AircraftDisplayOptionsEnum.altitudeFilterLimits]: false,
    [AircraftDisplayOptionsEnum.filterAbove]: null,
    [AircraftDisplayOptionsEnum.filterBelow]: null,
    [AircraftDisplayOptionsEnum.autoDataBlockOffset]: false,
    [AircraftDisplayOptionsEnum.mspLabels]: false,
    [AircraftDisplayOptionsEnum.routePreviewMinutes]: 0
  },
  displayData: null
};

const gpdSlice = createSlice({
  name: 'gpd',
  initialState: initialState as GpdStateType,
  reducers: {
    setGpdDisplayData(state, action) {
      state.displayData = action.payload;
    },
    setMapFeatureOptions(state, action: { payload: MapFeatureOptionsType }) {
      state.mapFeatureOptions = action.payload;
    },
    setAircraftDisplayOptions(state, action: { payload: aircraftDisplayOptionsType }) {
      state.aircraftDisplayOptions = action.payload;
    },
    setSectorTypes(state, action: { payload: Record<string, SectorTypeEnum> }) {
      state.sectorTypes = action.payload;
    },
    setNavaids(state, action: { payload: FixType[] }) {
      state.navaids = action.payload;
    },
    setWaypoints(state, action: { payload: FixType[] }) {
      state.waypoints = action.payload;
    },
    setAirways(state, action: {payload: AirwaySegmentType[]}) {
      for (let segment of action.payload) {
        if (!state.airways[segment.airway]) {
          state.airways[segment.airway] = [];
        }
        state.airways[segment.airway].push(segment);
      }
    }
  }
});

export const {
  setGpdDisplayData,
  setMapFeatureOptions,
  setAircraftDisplayOptions,
  setSectorTypes,
  setNavaids,
  setWaypoints,
  setAirways
} = gpdSlice.actions;
export default gpdSlice.reducer;

export const gpdMapFeatureOptionsSelector = (state: RootState) => state.gpd.mapFeatureOptions;
export const gpdAircraftDispalyOptionsSelector = (state: RootState) => state.gpd.aircraftDisplayOptions;
export const gpdSectorTypesSelector = (state: RootState) => state.gpd.sectorTypes;
export const gpdNavaidSelector = (state: RootState) => state.gpd.navaids;
export const gpdWaypointSelector = (state: RootState) => state.gpd.waypoints;
export const gpdAirwaySelector = (state: RootState) => state.gpd.airways;
