import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { AclSortData } from "../../types/aclSortData";
import { AclSortOption } from "../../enums/acl/aclSortOption";

type ToolsOptions = { displayCoordinationColumn: boolean; dropTrackDelete: boolean; iafDofManual: boolean; nonRvsmIndicator: boolean };

export type AclState = {
  sortData: AclSortData;
  manualPosting: boolean;
  toolsOptions: ToolsOptions;
};

const initialState: AclState = {
  sortData: { selectedOption: AclSortOption.ACID, sector: false },
  manualPosting: true,
  toolsOptions: { displayCoordinationColumn: false, dropTrackDelete: false, iafDofManual: false, nonRvsmIndicator: false }
};

const aclSlice = createSlice({
  name: "acl",
  initialState,
  reducers: {
    setAclSort(state, action: PayloadAction<AclSortData>) {
      state.sortData = action.payload;
    },
    setAclManualPosting(state, action: PayloadAction<boolean>) {
      state.manualPosting = action.payload;
    },
    updateToolsOptions(state, action: PayloadAction<ToolsOptions>) {
      state.toolsOptions = action.payload;
    }
  }
});

export const { setAclSort, setAclManualPosting, updateToolsOptions } = aclSlice.actions;
export default aclSlice.reducer;

export const toolsOptionsSelector = (state: RootState) => state.acl.toolsOptions;
export const aclSortDataSelector = (state: RootState) => state.acl.sortData;
export const aclManualPostingSelector = (state: RootState) => state.acl.manualPosting;
