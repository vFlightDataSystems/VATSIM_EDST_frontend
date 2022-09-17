import { RootThunkAction } from "../store";
import { rmvEntryFromAcl } from "../slices/entrySlice";
import { REMOVAL_TIMEOUT } from "../../utils/constants";

export const aclCleanup: RootThunkAction = (dispatch, getState) => {
  const state = getState();
  const { entries } = state;
  const now = new Date().getTime();
  const pendingRemovalEntryList = Object.values(entries).filter(entry => entry.aclDisplay && now - (entry?.pendingRemoval ?? now) > REMOVAL_TIMEOUT);
  pendingRemovalEntryList.forEach(entry => {
    dispatch(rmvEntryFromAcl(entry.aircraftId));
  });
};
