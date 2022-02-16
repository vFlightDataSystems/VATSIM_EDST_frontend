import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store";

export type DepStateType = {
  cidList: string[],
  deletedList: string[],
  spaList: string[]
  sortData: { name: string, sector: boolean },
  manualPosting: boolean
};

const initialState = {
  cidList: [],
  deletedList: [],
  spaList: [],
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
      state.deletedList = action.payload.deletedList;
    },
    setDepSort(state: DepStateType, action) {
      state.sortData = action.payload;
    },
    setDepManualPosting(state: DepStateType, action) {
      state.manualPosting = action.payload;
    },
    toggleDepSpa(state: DepStateType, action) {
      if (!state.spaList.includes(action.payload)) {
        state.spaList.push(action.payload);
      } else {
        const spaListSet = new Set(state.spaList);
        spaListSet.delete(action.payload);
        state.spaList = [...spaListSet];
      }
    }
  }
});

export const {
  addDepCid,
  deleteDepCid,
  setDepCidList,
  setDepSort,
  setDepManualPosting,
  toggleDepSpa
} = depSlice.actions;
export default depSlice.reducer;

export const depSpaListSelector = (state: RootState) => state.dep.spaList;