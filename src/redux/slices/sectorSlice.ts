import { Feature, polygon, Polygon } from "@turf/turf";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Fix, SectorData } from "../../types";
import { RootState } from "../store";

type SectorProfile = { id: string; name: string; sectors: string[] };

export type SectorDataState = {
  sectors: Record<string, Feature<Polygon>>;
  profiles: SectorProfile[];
  selectedSectorIds: string[];
  referenceFixes: Fix[];
  sectorId: string;
  artccId: string;
};

const initialState: SectorDataState = {
  sectors: {},
  profiles: [],
  selectedSectorIds: [],
  referenceFixes: [],
  sectorId: "",
  artccId: process.env.REACT_APP_DEV_DEFAULT_ARTCC ?? ""
};

const sectorSlice = createSlice({
  name: "sectorData",
  initialState,
  reducers: {
    setSectors(state: SectorDataState, action: PayloadAction<SectorData[]>) {
      state.sectors = Object.fromEntries(
        action.payload.map(sector => [sector.properties.id, polygon(sector.geometry.coordinates, sector.properties)])
      );
    },
    setSelectedSectors(state: SectorDataState, action: PayloadAction<string[]>) {
      state.selectedSectorIds = action.payload;
    },
    toggleSector(state: SectorDataState, action: PayloadAction<string>) {
      if (state.selectedSectorIds.includes(action.payload)) {
        const selectedSectorsSet = new Set(state.selectedSectorIds);
        selectedSectorsSet.delete(action.payload);
        state.selectedSectorIds = [...selectedSectorsSet];
      } else {
        state.selectedSectorIds = [...state.selectedSectorIds, action.payload];
      }
    },
    setArtccId(state: SectorDataState, action: PayloadAction<string>) {
      state.artccId = action.payload;
    },
    setSectorId(state: SectorDataState, action: PayloadAction<string>) {
      state.sectorId = action.payload;
    },
    setSectorProfiles(state, action: PayloadAction<SectorProfile[]>) {
      state.profiles = action.payload;
    },
    setReferenceFixes(state: SectorDataState, action: PayloadAction<Fix[]>) {
      state.referenceFixes = action.payload;
    }
  }
});

export const { setSectors, setSelectedSectors, toggleSector, setArtccId, setSectorId, setReferenceFixes, setSectorProfiles } = sectorSlice.actions;
export default sectorSlice.reducer;
export const referenceFixSelector = (state: RootState) => state.sectorData.referenceFixes;
export const sectorPolygonSelector = (state: RootState) => state.sectorData.sectors;
export const sectorIdSelector = (state: RootState) => state.sectorData.sectorId;
export const sectorProfilesSelector = (state: RootState) => state.sectorData.profiles;
export const selectedSectorsSelector = (state: RootState) => state.sectorData.selectedSectorIds;
