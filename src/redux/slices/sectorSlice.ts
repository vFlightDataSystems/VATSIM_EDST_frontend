import {Feature, polygon, Polygon} from "@turf/turf";
import {createSlice} from "@reduxjs/toolkit";
import {SectorDataType} from "../../types";
import {RootState} from "../store";

export type SectorDataStateType = {
  sectors: {[id: string]: Feature<Polygon>},
  selectedSectors: string[],
  referenceFixes: any[],
  sectorId: string,
  artccId: string
};

const initialState = {
  sectors: {},
  selectedSectors: [],
  referenceFixes: [],
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
        state.selectedSectors = [...selectedSectorsSet]
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
    }
  }
});

export const {setSectors, setSelectedSectors, toggleSector, setArtccId, setSectorId, setReferenceFixes} = sectorSlice.actions
export default sectorSlice.reducer;
export const referenceFixSelector = (state: RootState) => state.sectorData.referenceFixes;
export const sectorPolygonSelector = (state: RootState) => state.sectorData.sectors;