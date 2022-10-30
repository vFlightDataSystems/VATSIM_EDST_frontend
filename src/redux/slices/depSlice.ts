import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { DepSortOption } from "enums/dep/depSortOption";
import type { DepRowField } from "enums/dep/depRowField";
import type { RootState } from "~redux/store";
import sharedSocket from "~socket";

export type DepState = {
  selectedSortOption: DepSortOption;
  manualPosting: boolean;
  hiddenColumns: DepRowField[];
};

const initialState: DepState = {
  selectedSortOption: DepSortOption.ACID,
  manualPosting: true,
  hiddenColumns: [],
};

const depSlice = createSlice({
  name: "dep",
  initialState,
  reducers: {
    setDepState(state, action: PayloadAction<DepState>) {
      return action.payload;
    },
    setDepSort(state, action: PayloadAction<DepSortOption>) {
      state.selectedSortOption = action.payload;
      sharedSocket.setDepState(state);
    },
    setDepManualPosting(state, action: PayloadAction<boolean>) {
      state.manualPosting = action.payload;
      sharedSocket.setDepState(state);
    },
    toggleDepHideColumn(state, action: PayloadAction<DepRowField | DepRowField[]>) {
      if (Array.isArray(action.payload)) {
        action.payload.forEach((column) => {
          const index = state.hiddenColumns.indexOf(column);
          if (index > -1) {
            state.hiddenColumns.splice(index, 1);
          } else {
            state.hiddenColumns.push(column);
          }
        });
      } else {
        const index = state.hiddenColumns.indexOf(action.payload);
        if (index > -1) {
          state.hiddenColumns.splice(index, 1);
        } else {
          state.hiddenColumns.push(action.payload);
        }
      }
      sharedSocket.setDepState(state);
    },
  },
});

export const { toggleDepHideColumn, setDepState, setDepSort, setDepManualPosting } = depSlice.actions;
export default depSlice.reducer;
export const depSortOptionSelector = (state: RootState) => state.dep.selectedSortOption;
export const depManualPostingSelector = (state: RootState) => state.dep.manualPosting;
export const depHiddenColumnsSelector = (state: RootState) => state.dep.hiddenColumns;
