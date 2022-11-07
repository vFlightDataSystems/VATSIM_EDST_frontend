import { createSelector } from "@reduxjs/toolkit";
import { AclSortOption } from "enums/acl/aclSortOption";
import type { EdstEntry } from "types/edstEntry";
import { DepSortOption } from "enums/dep/depSortOption";
import { entriesSelector } from "~redux/slices/entrySlice";
import { depManualPostingSelector, depSortOptionSelector } from "~redux/slices/depSlice";
import { aclManualPostingSelector, aclSortDataSelector } from "~redux/slices/aclSlice";
import type { RootState } from "~redux/store";
import { sigmetSelector } from "~redux/slices/weatherSlice";

export const anyHoldingSelector = createSelector([entriesSelector], (entries) => {
  for (const entry of Object.values(entries)) {
    if (entry.holdAnnotations && !entry.deleted) {
      return true;
    }
  }
  return false;
});

// check whether any aircraft in the list has an assigned heading or a speed
// will display a * next to Hdg or Spd if the column is hidden, respectively

export const anyAssignedHdgSelector = createSelector([entriesSelector], (entries) => {
  for (const entry of Object.values(entries)) {
    if ((entry.assignedHeading || entry.scratchpadHeading) && !entry.deleted) {
      return true;
    }
  }
  return false;
});

export const anyAssignedSpdSelector = createSelector([entriesSelector], (entries) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const entry of Object.values(entries)) {
    if ((entry.assignedSpeed || entry.scratchpadSpeed) && !entry.deleted) {
      return true;
    }
  }
  return false;
});

const depEntriesSelector = createSelector([entriesSelector], (entries) => {
  return Object.values(entries).filter((entry) => entry.status === "Proposed" && !entry.deleted);
});

export const depLenSelector = (state: RootState) => depEntriesSelector(state).length;

export const depSpaListSelector = createSelector([depEntriesSelector], (entries) => {
  return Object.values(entries)
    .filter((entry) => entry.spa)
    .map((entry) => entry.aircraftId);
});

const depNotSpaListSelector = createSelector([depEntriesSelector], (entries) => {
  return Object.values(entries).filter((entry) => !entry.spa);
});

const depSortFunc = (selectedSortOption: DepSortOption) => (u: EdstEntry, v: EdstEntry) => {
  switch (selectedSortOption) {
    case DepSortOption.ACID:
      return u.aircraftId.localeCompare(v.aircraftId);
    case DepSortOption.DESTINATION:
      return u.destination.localeCompare(v.destination);
    case DepSortOption.ORIGIN:
      return u.departure?.localeCompare(v.departure);
    default:
      return u.aircraftId.localeCompare(v.aircraftId);
  }
};

export const depAckListSelector = createSelector(
  [depNotSpaListSelector, depManualPostingSelector, depSortOptionSelector],
  (entries, manualPosting, sortOption) => {
    return entries
      .filter((entry) => entry.depStatus > -1 || !manualPosting)
      .sort(depSortFunc(sortOption))
      .map((entry) => entry.aircraftId);
  }
);

export const depUnAckListSelector = createSelector([depNotSpaListSelector], (entries) => {
  return entries.filter((entry) => entry.depStatus === -1).map((entry) => entry.aircraftId);
});

const aclEntriesSelector = createSelector([entriesSelector], (entries) => {
  return Object.values(entries).filter((entry) => entry.status === "Active" && !entry.deleted);
});

export const aclLenSelector = (state: RootState) => aclEntriesSelector(state).length;

export const aclSpaListSelector = createSelector([aclEntriesSelector], (entries) => {
  return Object.values(entries)
    .filter((entry) => entry.spa)
    .map((entry) => entry.aircraftId);
});

const aclNotSpaListSelector = createSelector([aclEntriesSelector], (entries) => {
  return Object.values(entries).filter((entry) => !entry.spa);
});

const aclSortFunc = (selectedOption: AclSortOption) => (u: EdstEntry, v: EdstEntry) => {
  switch (selectedOption) {
    case AclSortOption.ACID:
      return u.aircraftId.localeCompare(v.aircraftId);
    case AclSortOption.DESTINATION:
      return u.destination.localeCompare(v.destination);
    case AclSortOption.BOUNDARY_TIME:
      return u.boundaryTime - v.boundaryTime;
    default:
      return u.aircraftId.localeCompare(v.aircraftId);
  }
};

export const aclAckListSelector = createSelector(
  [aclNotSpaListSelector, aclManualPostingSelector, aclSortDataSelector],
  (entries, manualPosting, sortData) => {
    return entries
      .filter((entry) => entry.vciStatus > -1 || !manualPosting)
      .sort(aclSortFunc(sortData.selectedOption))
      .map((entry) => entry.aircraftId);
  }
);

export const aclUnAckListSelector = createSelector([aclNotSpaListSelector], (entries) => {
  return entries.filter((entry) => entry.vciStatus === -1).map((entry) => entry.aircraftId);
});

export const sigmetLenSelector = createSelector([sigmetSelector], (sigmets) => {
  return Object.values(sigmets).filter((sigmetEntry) => !sigmetEntry.acknowledged).length;
});
