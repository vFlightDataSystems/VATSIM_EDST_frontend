import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { SortOptions } from "../../namespaces";

export type DepState = {
  sortData: { selectedOption: SortOptions; sector: boolean };
  manualPosting: boolean;
};

const initialState: DepState = {
  sortData: { selectedOption: SortOptions.ACID, sector: false },
  manualPosting: true
};

const depSlice = createSlice({
  name: "dep",
  initialState,
  reducers: {
    setDepSort(state: DepState, action: { payload: SortOptions }) {
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
