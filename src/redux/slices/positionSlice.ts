import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "~redux/store";
import OpenPositionDto from "~/types/apiTypes/OpenPositionDto";
import { PositionType } from "~/types/apiTypes/OpenPositionDto";

export type ArtccInfo = {
  artccId: string;
  nasId: string;
  neighboringFacilityIds: string[];
  neighboringNasIds: Record<string, string>; // Map of facility ID to NAS ID
};

export type PositionState = {
  openPositions: Record<string, OpenPositionDto>;
  artccInfo: ArtccInfo | null;
};

const initialState: PositionState = {
  openPositions: {},
  artccInfo: null,
};

const positionSlice = createSlice({
  name: "position",
  initialState,
  reducers: {
    setOpenPositions(state, action: PayloadAction<OpenPositionDto[]>) {
      // Merge new positions with existing ones instead of clearing
      action.payload.forEach((position) => {
        state.openPositions[position.id] = position;
      });
    },
    updateOpenPosition(state, action: PayloadAction<OpenPositionDto>) {
      state.openPositions[action.payload.id] = action.payload;
    },
    removeOpenPositions(state, action: PayloadAction<string[]>) {
      action.payload.forEach((positionId) => {
        delete state.openPositions[positionId];
      });
    },
    removeOpenPosition(state, action: PayloadAction<string>) {
      delete state.openPositions[action.payload];
    },
    clearOpenPositions(state) {
      state.openPositions = {};
    },
    setArtccInfo(state, action: PayloadAction<ArtccInfo>) {
      state.artccInfo = action.payload;
    },
    clearArtccInfo(state) {
      state.artccInfo = null;
    },
  },
});

export const { setOpenPositions, updateOpenPosition, removeOpenPosition, removeOpenPositions, clearOpenPositions, setArtccInfo, clearArtccInfo } =
  positionSlice.actions;
export default positionSlice.reducer;

// Selectors
export const openPositionsSelector = (state: RootState) => state.position.openPositions;
export const openPositionByIdSelector = (state: RootState, positionId: string) => state.position.openPositions[positionId];
export const openPositionsByFacilitySelector = (state: RootState, facilityId: string) =>
  Object.values(state.position.openPositions).filter((position) => position.facilityId === facilityId);
export const activeOpenPositionsSelector = (state: RootState) => Object.values(state.position.openPositions).filter((position) => position.isActive);
export const activeArtccPositionsSelector = (state: RootState) => 
  Object.values(state.position.openPositions).filter((position) => position.type === PositionType.Artcc && position.isActive);
export const primaryOpenPositionsSelector = (state: RootState) =>
  Object.values(state.position.openPositions).filter((position) => position.isPrimary);
export const artccInfoSelector = (state: RootState) => state.position.artccInfo;
export const neighboringNasIdsSelector = (state: RootState) => state.position.artccInfo?.neighboringNasIds ?? {};
