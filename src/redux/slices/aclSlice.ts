import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { SortOptions } from "../../namespaces";

type ToolsOptions = { displayCoordinationColumn: boolean; dropTrackDelete: boolean; iafDofManual: boolean; nonRvsmIndicator: boolean };

export type AclState = {
  sortData: { selectedOption: SortOptions; sector: boolean };
  manualPosting: boolean;
  toolsOptions: ToolsOptions;
};

const initialState: AclState = {
  sortData: { selectedOption: SortOptions.ACID, sector: false },
  manualPosting: true,
  toolsOptions: { displayCoordinationColumn: false, dropTrackDelete: false, iafDofManual: false, nonRvsmIndicator: false }
};

const aclSlice = createSlice({
  name: "acl",
  initialState,
  reducers: {
    setAclSort(state, action: { payload: { selectedOption: SortOptions; sector: boolean } }) {
      state.sortData = action.payload;
    },
    setAclManualPosting(state, action: { payload: boolean }) {
      state.manualPosting = action.payload;
    },
    updateToolsOptions(state, action: { payload: ToolsOptions }) {
      state.toolsOptions = action.payload;
    }
  }
});

export const { setAclSort, setAclManualPosting, updateToolsOptions } = aclSlice.actions;
export default aclSlice.reducer;

export const toolsOptionsSelector = (state: RootState) => state.acl.toolsOptions;
export const aclSortDataSelector = (state: RootState) => state.acl.sortData;
export const aclManualPostingSelector = (state: RootState) => state.acl.manualPosting;
