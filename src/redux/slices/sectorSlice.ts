import {Feature, polygon, Polygon} from "@turf/turf";
import {createSlice} from "@reduxjs/toolkit";
import {NavaidType, SectorDataType} from "../../types";
import {RootState} from "../store";

export type SectorDataStateType = {
  sectors: {[id: string]: Feature<Polygon>},
  selectedSectors: string[],
  referenceFixes: any[],
  sectorId: string,
  artccId: string,
  vorHighList: NavaidType[],
  vorLowList: NavaidType[]
};

const initialState = {
  sectors: {},
  selectedSectors: [],
  referenceFixes: [],
  vorHighList: [],
  vorLowList: [],
  sectorId: '',
  artccId: ''
};

const sectorSlice = createSlice({
  name: 'sectorData',
  initialState: initialState as SectorDataStateType,
  reducers: {
    setSectors(state: SectorDataStateType, action) {
      state.sectors = Object.fromEntries(action.payload.map((sector: SectorDataType) => [sector.properties.id, polygon(sector.geometry.coordinates, sector.properties)]));
    },
    setSelectedSectors(state: SectorDataStateType, action) {
      state.selectedSectors = action.payload;
    },
    toggleSector(state: SectorDataStateType, action) {
      if (state.selectedSectors.includes(action.payload)) {
        const selectedSectorsSet = new Set(state.selectedSectors);
        selectedSectorsSet.delete(action.payload);
        state.selectedSectors = [...selectedSectorsSet];
      }
      else {
        state.selectedSectors = [...state.selectedSectors, action.payload];
      }
    },
    setArtccId(state: SectorDataStateType, action) {
      state.artccId = action.payload;
    },
    setSectorId(state: SectorDataStateType, action) {
      state.sectorId = action.payload;
    },
    setReferenceFixes(state: SectorDataStateType, action) {
      state.referenceFixes = action.payload;
    },
    setVorHighList(state: SectorDataStateType, action) {
      state.vorHighList = action.payload;
    },
    setVorLowList(state: SectorDataStateType, action) {
      state.vorLowList = action.payload;
    }
  }
});

export const {setSectors, setSelectedSectors, toggleSector, setArtccId, setSectorId, setReferenceFixes, setVorHighList, setVorLowList} = sectorSlice.actions
export default sectorSlice.reducer;
export const referenceFixSelector = (state: RootState) => state.sectorData.referenceFixes;
export const sectorPolygonSelector = (state: RootState) => state.sectorData.sectors;
export const vorHighListSelector = (state: RootState) => state.sectorData.vorHighList;
export const vorLowListSelector = (state: RootState) => state.sectorData.vorLowList;
