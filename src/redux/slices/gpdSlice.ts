import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store";

export type GpdStateType = {
  mapOptions: {},
  displayCidList: string[]
};

const initialState = {
  mapOptions: {},
  displayCidList: []
};

const gpdSlice = createSlice({
  name: 'gpd',
  initialState: initialState as GpdStateType,
  reducers: {
    setGpdDisplayCidList(state, action: {payload: string[]}) {
      state.displayCidList = action.payload;
    }
  }
});

export const {
  setGpdDisplayCidList
} = gpdSlice.actions;
export default gpdSlice.reducer;

export const gpdCidListSelector = (state: RootState) => state.gpd.displayCidList;