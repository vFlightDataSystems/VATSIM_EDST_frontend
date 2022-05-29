import { createSlice } from "@reduxjs/toolkit";
import { sortOptions } from "../../enums";
import { RootState } from "../store";

export type DepState = {
  sortData: { selectedOption: sortOptions; sector: boolean };
  manualPosting: boolean;
};

const initialState = {
  sortData: { selectedOption: sortOptions.acid, sector: false },
  manualPosting: true
};

const depSlice = createSlice({
  name: "dep",
  initialState: initialState as DepState,
  reducers: {
    setDepSort(state: DepState, action: { payload: sortOptions }) {
      state.sortData.selectedOption = action.payload;
    },
    setDepManualPosting(state: DepState, action) {
      state.manualPosting = action.payload;
    }
  }
});

export const { setDepSort, setDepManualPosting } = depSlice.actions;
export default depSlice.reducer;
export const depSortDataSelector = (state: RootState) => state.dep.sortData;
export const depManualPostingSelector = (state: RootState) => state.dep.manualPosting;
