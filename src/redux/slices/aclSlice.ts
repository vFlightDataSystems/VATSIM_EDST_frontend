import {createSlice} from "@reduxjs/toolkit";
import {sortOptionsEnum} from "../../enums";
import {RootState} from "../store";

type ToolsOptionsType = { displayCoordinationColumn: boolean, dropTrackDelete: boolean, iafDofManual: boolean, nonRvsmIndicator: boolean };

export type AclStateType = {
  sortData: { selectedOption: sortOptionsEnum, sector: boolean },
  manualPosting: boolean,
  toolsOptions: ToolsOptionsType
};

const initialState = {
  sortData: {selectedOption: sortOptionsEnum.acid, sector: false},
  manualPosting: true,
  toolsOptions: {displayCoordinationColumn: false, dropTrackDelete: false, iafDofManual: false, nonRvsmIndicator: false}
};

const aclSlice = createSlice({
  name: 'acl',
  initialState: initialState as AclStateType,
  reducers: {
    setAclSort(state, action: { payload: { selectedOption: sortOptionsEnum, sector: boolean } }) {
      state.sortData = action.payload;
    },
    setAclManualPosting(state, action: { payload: boolean }) {
      state.manualPosting = action.payload;
    },
    updateToolsOptions(state, action: { payload: ToolsOptionsType }) {
      state.toolsOptions = action.payload;
    }
  }
});

export const {
  setAclSort,
  setAclManualPosting,
  updateToolsOptions
} = aclSlice.actions;
export default aclSlice.reducer;

export const toolsOptionsSelector = (state: RootState) => state.acl.toolsOptions;
export const aclSortDataSelector = (state: RootState) => state.acl.sortData;
export const aclManualPostingSelector = (state: RootState) => state.acl.manualPosting;