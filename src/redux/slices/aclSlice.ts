import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { AclSortData, AclSortKey } from "types/aclSortData";
import { ACL_SORT_MAP } from "types/aclSortData";
import type { AclRowField } from "types/acl/aclRowField";
import sharedSocket from "~socket";
import type { RootState } from "~redux/store";

type ToolsOptions = {
  displayCoordinationColumn: boolean;
  dropTrackDelete: boolean;
  iafDofManual: boolean;
  nonRvsmIndicator: boolean;
};

export type AclState = {
  sortData: AclSortData;
  manualPosting: boolean;
  toolsOptions: ToolsOptions;
  hiddenColumns: AclRowField[];
};

const initialState: AclState = {
  sortData: { selectedOption: "ACL_ACID_SORT_OPTION", sector: false },
  manualPosting: true,
  toolsOptions: {
    displayCoordinationColumn: false,
    dropTrackDelete: false,
    iafDofManual: false,
    nonRvsmIndicator: false,
  },
  hiddenColumns: [],
};

const aclSlice = createSlice({
  name: "acl",
  initialState,
  reducers: {
    setAclState(state, action: PayloadAction<AclState>) {
      return action.payload;
    },
    setAclSort(state, action: PayloadAction<AclSortKey | AclSortData>) {
      if (typeof action.payload === "string") {
        state.sortData = ACL_SORT_MAP[action.payload];
      } else {
        state.sortData = action.payload;
      }
      sharedSocket.setAclState(state);
    },
    setAclManualPosting(state, action: PayloadAction<boolean>) {
      state.manualPosting = action.payload;
      sharedSocket.setAclState(state);
    },
    updateToolsOptions(state, action: PayloadAction<ToolsOptions>) {
      state.toolsOptions = action.payload;
      sharedSocket.setAclState(state);
    },
    toggleAclHideColumn(state, action: PayloadAction<AclRowField | AclRowField[]>) {
      if (Array.isArray(action.payload)) {
        action.payload.forEach((column) => {
          const index = state.hiddenColumns.indexOf(column);
          if (index > -1) {
            state.hiddenColumns.splice(index, 1);
          } else {
            state.hiddenColumns.push(column);
          }
        });
      } else {
        const index = state.hiddenColumns.indexOf(action.payload);
        if (index > -1) {
          state.hiddenColumns.splice(index, 1);
        } else {
          state.hiddenColumns.push(action.payload);
        }
      }
      sharedSocket.setAclState(state);
    },
  },
});

export const { setAclState, setAclSort, setAclManualPosting, updateToolsOptions, toggleAclHideColumn } = aclSlice.actions;
export default aclSlice.reducer;

export const toolsOptionsSelector = (state: RootState) => state.acl.toolsOptions;
export const aclSortDataSelector = (state: RootState) => state.acl.sortData;
export const aclManualPostingSelector = (state: RootState) => state.acl.manualPosting;
export const aclHiddenColumnsSelector = (state: RootState) => state.acl.hiddenColumns;
