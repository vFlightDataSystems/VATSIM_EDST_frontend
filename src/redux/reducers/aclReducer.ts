import {AselType} from "../../types";
import {createSlice} from "@reduxjs/toolkit";

export type AclStateType = {
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
    setAclCidList(state: AclStateType, action) {
      state.cidList = action.payload.cidList;
      state.deletedList = action.payload.deletedList
    },
    setAclSort(state: AclStateType, action) {
      state.sortData = action.payload;
    },
    setAclManualPosting(state: AclStateType, action) {
      state.manualPosting = action.payload;
    }
  }
});

export const {addAclCid, deleteAclCid, setAclCidList, setAclSort, setAclManualPosting} = aclSlice.actions;
export default aclSlice.reducer;