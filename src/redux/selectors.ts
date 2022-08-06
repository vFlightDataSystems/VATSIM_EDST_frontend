import { createSelector } from "@reduxjs/toolkit";
import { entriesSelector } from "./slices/entrySlice";

export const anyHoldingSelector = createSelector([entriesSelector], entries => {
  // eslint-disable-next-line no-restricted-syntax
  for (const entry of Object.values(entries)) {
    if (entry.holdAnnotations && entry.aclDisplay) {
      return true;
    }
  }
  return false;
});

// check whether any aircraft in the list has an assigned heading or a speed
// will display a * next to Hdg or Spd if the column is hidden, respectively

export const anyAssignedHdgSelector = createSelector([entriesSelector], entries => {
  // eslint-disable-next-line no-restricted-syntax
  for (const entry of Object.values(entries)) {
    if ((entry.assignedHeading || entry.scratchpadHeading) && entry.aclDisplay) {
      return true;
    }
  }
  return false;
});

export const anyAssignedSpdSelector = createSelector([entriesSelector], entries => {
  // eslint-disable-next-line no-restricted-syntax
  for (const entry of Object.values(entries)) {
    if ((entry.assignedSpeed || entry.scratchpadSpeed) && entry.aclDisplay) {
      return true;
    }
  }
  return false;
});
