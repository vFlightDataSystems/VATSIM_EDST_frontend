import {createSelector} from "@reduxjs/toolkit";
import {entriesSelector} from "./slices/entriesSlice";
import {aclCidListSelector} from "./slices/aclSlice";

export const anyHoldingSelector = createSelector([entriesSelector, aclCidListSelector], (entries, cidList) => {
  for (let cid of cidList) {
    if (entries[cid]?.hold_data) {
      return true
    }
  }
  return false;
});

// check whether any aircraft in the list has an assigned heading or a speed
// will display a * next to Hdg or Spd if the column is hidden, respectively

export const anyAssignedHdgSelector = createSelector([entriesSelector, aclCidListSelector], (entries, cidList) => {
  for (let cid of cidList) {
    if (entries[cid]?.hdg || entries[cid]?.scratch_hdg) {
      return true;
    }
  }
  return false;
});

export const anyAssignedSpdSelector = createSelector([entriesSelector, aclCidListSelector], (entries, cidList) => {
  for (let cid of cidList) {
    if (entries[cid]?.spd || entries[cid]?.scratch_spd) {
      return true;
    }
  }
  return false;
})