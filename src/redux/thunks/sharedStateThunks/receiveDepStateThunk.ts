import { SharedDepState } from "../../../typeDefinitions/types/sharedStateTypes/sharedDepState";
import { RootThunkAction } from "../../store";
import { setDepSort } from "../../slices/depSlice";
import { setAclManualPosting } from "../../slices/aclSlice";

export function receiveDepStateThunk(depState: SharedDepState): RootThunkAction {
  return dispatch => {
    dispatch(setDepSort(depState.sortOption));
    dispatch(setAclManualPosting(depState.manualPosting));
  };
}
