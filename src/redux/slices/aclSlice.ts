import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store";

export type AclStateType = {
  cidList: string[],
  deletedList: string[],
  spaList: string[],
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

const aclSlice = createSlice({
  name: 'acl',
  initialState: initialState as AclStateType,
  reducers: {
    addAclCid(state: AclStateType, action) {
      state.cidList = [...new Set([...state.cidList, action.payload])];
    },
    deleteAclCid(state: AclStateType, action) {
      const cidListSet = new Set(state.cidList);
      cidListSet.delete(action.payload);
      state.cidList = [...cidListSet];
      state.deletedList = [...new Set([...state.deletedList, action.payload])];
    },
    setAclLists(state: AclStateType, action) {
      state.cidList = action.payload.cidList;
      state.deletedList = action.payload.deletedList;
    },
    setAclSort(state: AclStateType, action) {
      state.sortData = action.payload;
    },
    setAclManualPosting(state: AclStateType, action) {
      state.manualPosting = action.payload;
    },
    toggleAclSpa(state: AclStateType, action) {
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
  addAclCid,
  deleteAclCid,
  setAclLists,
  setAclSort,
  setAclManualPosting,
  toggleAclSpa
} = aclSlice.actions;
export default aclSlice.reducer;

export const aclCidListSelector = (state: RootState) => state.acl.cidList;