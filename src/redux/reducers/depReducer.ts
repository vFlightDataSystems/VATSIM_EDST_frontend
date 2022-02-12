import {AselType} from "../../types";
import {createSlice} from "@reduxjs/toolkit";

export type DepStateType = {
  cidList: string[],
  deletedList: string[],
  asel: AselType | null,
  sortData: { name: string, sector: boolean },
  manualPosting: boolean
};

const initialState = {
  cidList: [],
  deletedList: [],
  asel: null,
  sortData: {name: 'ACID', sector: false},
  manualPosting: true
};

const depSlice = createSlice({
  name: 'dep',
  initialState: initialState as DepStateType,
  reducers: {
    addDepCid(state: DepStateType, action) {
      state.cidList = [...new Set([...state.cidList, action.payload])];
    },
    deleteDepCid(state: DepStateType, action) {
      const cidListSet = new Set(state.cidList);
      cidListSet.delete(action.payload);
      state.cidList = [...cidListSet];
      state.deletedList = [...new Set([...state.deletedList, action.payload])];
    },
    setDepCidList(state: DepStateType, action) {
      state.cidList = action.payload.cidList;
      state.deletedList = action.payload.deletedList
    },
    setDepSort(state: DepStateType, action) {
      state.sortData = action.payload;
    },
    setDepManualPosting(state: DepStateType, action) {
      state.manualPosting = action.payload;
    }
  }
});

export const {addDepCid, deleteDepCid, setDepCidList, setDepSort, setDepManualPosting} = depSlice.actions;
export default depSlice.reducer;