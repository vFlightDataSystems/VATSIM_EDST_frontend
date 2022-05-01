import {createSlice} from "@reduxjs/toolkit";
import {sortOptionsEnum} from "../../enums";
import {RootState} from "../store";

export type DepStateType = {
  sortData: { selectedOption: sortOptionsEnum, sector: boolean },
  manualPosting: boolean
};

const initialState = {
  sortData: {selectedOption: sortOptionsEnum.acid, sector: false},
  manualPosting: true
};

const depSlice = createSlice({
  name: 'dep',
  initialState: initialState as DepStateType,
  reducers: {
    setDepSort(state: DepStateType, action: { payload: sortOptionsEnum }) {
      state.sortData.selectedOption = action.payload;
    },
    setDepManualPosting(state: DepStateType, action) {
      state.manualPosting = action.payload;
    }
  }
});

export const {
  setDepSort,
  setDepManualPosting,
} = depSlice.actions;
export default depSlice.reducer;
export const depSortDataSelector = (state: RootState) => state.dep.sortData;
export const depManualPostingSelector = (state: RootState) => state.dep.manualPosting;