import {Feature, Polygon} from "@turf/turf";
import {createSlice} from "@reduxjs/toolkit";

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
      state.sectors = action.payload;
    },
    setSelectedSectors(state: SectorDataStateType, action) {
      state.selectedSectors=  action.payload;
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