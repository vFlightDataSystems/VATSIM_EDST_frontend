import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { SortOptions } from "../../namespaces";
import { SortData } from "../../types/sortData";

type DepState = {
  sortData: SortData;
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
    setDepSort(state, action: PayloadAction<SortData>) {
      state.sortData.selectedOption = action.payload.selectedOption;
    },
    setDepManualPosting(state, action: PayloadAction<boolean>) {
      state.manualPosting = action.payload;
    }
  }
});

export const { setDepSort, setDepManualPosting } = depSlice.actions;
export default depSlice.reducer;
export const depSortDataSelector = (state: RootState) => state.dep.sortData;
export const depManualPostingSelector = (state: RootState) => state.dep.manualPosting;
