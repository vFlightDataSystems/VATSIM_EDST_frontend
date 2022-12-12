import { createSelector } from "@reduxjs/toolkit";
import type { AclSortOption } from "types/acl/aclSortOption";
import type { EdstEntry } from "types/edstEntry";
import type { DepSortOption } from "types/dep/depSortOption";
import { entriesSelector } from "~redux/slices/entrySlice";
import { depManualPostingSelector, depSortOptionSelector } from "~redux/slices/depSlice";
import { aclManualPostingSelector, aclSortDataSelector } from "~redux/slices/aclSlice";
import type { RootState } from "~redux/store";
import { sigmetSelector } from "~redux/slices/weatherSlice";
import type { AircraftId } from "types/aircraftId";

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

const depSortFunc = (selectedSortOption: DepSortOption) => (u: EdstEntry, v: EdstEntry) => {
  switch (selectedSortOption) {
    case "DEP_ACID_SORT_OPTION":
      return u.aircraftId.localeCompare(v.aircraftId);
    case "DEP_DESTINATION_SORT_OPTION":
      return u.destination.localeCompare(v.destination);
    case "DEP_ORIGIN_SORT_OPTION":
      return u.departure.localeCompare(v.departure);
    default:
      return u.aircraftId.localeCompare(v.aircraftId);
  }
};

export const depListSelector = createSelector(
  [entriesSelector, depManualPostingSelector, depSortOptionSelector],
  (entries, manualPosting, sortOption) => {
    const spaList: AircraftId[] = [];
    const ackEntryList: EdstEntry[] = [];
    const unAckList: AircraftId[] = [];
    Object.values(entries).forEach((entry) => {
      if (entry.status === "Proposed" && !entry.deleted) {
        if (entry.spa) {
          spaList.push(entry.aircraftId);
        } else if (entry.depStatus > -1 || !manualPosting) {
          ackEntryList.push(entry);
        } else {
          unAckList.push(entry.aircraftId);
        }
      }
    });
    ackEntryList.sort(depSortFunc(sortOption));
    const ackListSorted = ackEntryList.map((entry) => entry.aircraftId);
    return [spaList, ackListSorted, unAckList];
  }
);

export const aclEntriesSelector = createSelector([entriesSelector], (entries) => {
  return Object.values(entries).filter((entry) => entry.status === "Active" && !entry.deleted);
});

export const aclLenSelector = (state: RootState) => aclEntriesSelector(state).length;

const aclSortFunc = (selectedOption: AclSortOption) => (u: EdstEntry, v: EdstEntry) => {
  switch (selectedOption) {
    case "ACL_ACID_SORT_OPTION":
      return u.aircraftId.localeCompare(v.aircraftId);
    case "ACL_DESTINATION_SORT_OPTION":
      return u.destination.localeCompare(v.destination);
    case "ACL_BOUNDARY_TIME_SORT_OPTION":
      return u.boundaryTime - v.boundaryTime;
    default:
      return u.aircraftId.localeCompare(v.aircraftId);
  }
};

export const aclListSelector = createSelector(
  [entriesSelector, aclManualPostingSelector, aclSortDataSelector],
  (entries, manualPosting, sortData) => {
    const spaList: AircraftId[] = [];
    const ackEntryList: EdstEntry[] = [];
    const unAckList: AircraftId[] = [];
    Object.values(entries).forEach((entry) => {
      if (entry.status === "Active" && !entry.deleted) {
        if (entry.spa) {
          spaList.push(entry.aircraftId);
        } else if (entry.vciStatus > -1 || !manualPosting) {
          ackEntryList.push(entry);
        } else {
          unAckList.push(entry.aircraftId);
        }
      }
    });
    ackEntryList.sort(aclSortFunc(sortData.selectedOption));
    const ackListSorted = ackEntryList.map((entry) => entry.aircraftId);
    return [spaList, ackListSorted, unAckList];
  }
);

export const sigmetLenSelector = createSelector([sigmetSelector], (sigmets) => {
  return Object.values(sigmets).filter((sigmetEntry) => !sigmetEntry.acknowledged).length;
});
