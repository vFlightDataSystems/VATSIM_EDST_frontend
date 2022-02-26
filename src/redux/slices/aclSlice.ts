import {createSlice} from "@reduxjs/toolkit";
import {sortOptionsEnum} from "../../enums";

export type AclStateType = {
  sortData: { selectedOption: sortOptionsEnum, sector: boolean },

  manualPosting: boolean
};

const initialState = {
  sortData: {selectedOption: sortOptionsEnum.acid, sector: false},
  manualPosting: true
};

const aclSlice = createSlice({
  name: 'acl',
  initialState: initialState as AclStateType,
  reducers: {
    setAclSort(state: AclStateType, action: { payload: { selectedOption: sortOptionsEnum, sector: boolean } }) {
      state.sortData = action.payload;
    },
    setAclManualPosting(state: AclStateType, action) {
      state.manualPosting = action.payload;
    }
  }
});

export const {
  setAclSort,
  setAclManualPosting
} = aclSlice.actions;
export default aclSlice.reducer;