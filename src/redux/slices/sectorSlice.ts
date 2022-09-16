import { Feature, polygon, Polygon } from "@turf/turf";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { SectorData } from "../../typeDefinitions/types/sectorData";

type SectorProfile = { id: string; name: string; sectors: string[] };

export type SectorDataState = {
  sectors: Record<string, Feature<Polygon>>;
  profiles: SectorProfile[];
  selectedSectorIds: string[];
  sectorId: string;
  artccId: string;
};

const initialState: SectorDataState = {
  sectors: {},
  profiles: [],
  selectedSectorIds: [],
  sectorId: "",
  artccId: ""
};

const sectorSlice = createSlice({
  name: "sectorData",
  initialState,
  reducers: {
    setSectors(state: SectorDataState, action: PayloadAction<SectorData[]>) {
      state.sectors = Object.fromEntries(
        action.payload.map(sector => [sector.properties.id, polygon(sector.geometry.coordinates, sector.properties)])
      );
      state.selectedSectorIds = [Object.keys(state.sectors)[0]];
    },
    setSelectedSectors(state, action: PayloadAction<string[]>) {
      state.selectedSectorIds = action.payload;
    },
    toggleSector(state, action: PayloadAction<string>) {
      if (state.selectedSectorIds.includes(action.payload)) {
        const selectedSectorsSet = new Set(state.selectedSectorIds);
        selectedSectorsSet.delete(action.payload);
        state.selectedSectorIds = [...selectedSectorsSet];
      } else {
        state.selectedSectorIds = [...state.selectedSectorIds, action.payload];
      }
    },
    setArtccId(state, action: PayloadAction<string>) {
      state.artccId = action.payload.toUpperCase();
    },
    setSectorId(state: SectorDataState, action: PayloadAction<string>) {
      state.sectorId = action.payload;
    },
    setSectorProfiles(state, action: PayloadAction<SectorProfile[]>) {
      state.profiles = action.payload;
    }
  }
});

export const { setSectors, setSelectedSectors, toggleSector, setArtccId, setSectorId, setSectorProfiles } = sectorSlice.actions;
export default sectorSlice.reducer;
export const artccIdSelector = (state: RootState) => state.sectorData.artccId;
export const sectorPolygonSelector = (state: RootState) => state.sectorData.sectors;
export const sectorIdSelector = (state: RootState) => state.sectorData.sectorId;
export const sectorProfilesSelector = (state: RootState) => state.sectorData.profiles;
export const selectedSectorsSelector = (state: RootState) => state.sectorData.selectedSectorIds;
