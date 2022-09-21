import { RootThunkAction } from "../store";
import { REMOVAL_TIMEOUT } from "../../utils/constants";
import { delEntry } from "../slices/entrySlice";

export const aclCleanup: RootThunkAction = (dispatch, getState) => {
  const state = getState();
  const { entries } = state;
  const now = new Date().getTime();
  const pendingRemovalEntryList = Object.values(entries).filter(
    entry => entry.status === "Active" && now - (entry?.pendingRemoval ?? now) > REMOVAL_TIMEOUT
  );
  pendingRemovalEntryList.forEach(entry => {
    dispatch(delEntry(entry.aircraftId));
  });
};
