import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { DepSortOption } from "../../enums/dep/depSortOption";
import { setSharedDepManualPosting, setSharedDepSort } from "../../sharedState/socket";

type DepState = {
  selectedSortOption: DepSortOption;
  manualPosting: boolean;
};

const initialState: DepState = {
  selectedSortOption: DepSortOption.ACID,
  manualPosting: true
};

const depSlice = createSlice({
  name: "dep",
  initialState,
  reducers: {
    setDepSort(state, action: PayloadAction<DepSortOption>) {
      state.selectedSortOption = action.payload;
      setSharedDepSort(action.payload);
    },
    setDepManualPosting(state, action: PayloadAction<boolean>) {
      state.manualPosting = action.payload;
      setSharedDepManualPosting(action.payload);
    }
  }
});

export const { setDepSort, setDepManualPosting } = depSlice.actions;
export default depSlice.reducer;
export const depSortOptionSelector = (state: RootState) => state.dep.selectedSortOption;
export const depManualPostingSelector = (state: RootState) => state.dep.manualPosting;
