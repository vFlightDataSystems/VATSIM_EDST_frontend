import {createSlice} from "@reduxjs/toolkit";

export type ActionStateType = {
  refreshing: boolean
};

const ActionSlice = createSlice({
  name: 'action',
  initialState: {refreshing: false} as ActionStateType,
  reducers: {
    refreshStart(state: ActionStateType) {
      state.refreshing = true;
    },
    refreshStop(state: ActionStateType) {
      state.refreshing = false;
    }
  }
});

export const {refreshStart, refreshStop} = ActionSlice.actions;
export default ActionSlice.reducer;