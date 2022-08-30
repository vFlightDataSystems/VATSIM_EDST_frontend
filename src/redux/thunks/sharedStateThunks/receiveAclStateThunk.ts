import { SharedAclState } from "../../../typeDefinitions/types/sharedStateTypes/sharedAclState";
import { RootThunkAction } from "../../store";
import { setAclManualPosting, setAclSort } from "../../slices/aclSlice";

export function receiveAclStateThunk(aclState: SharedAclState): RootThunkAction {
  return dispatch => {
    dispatch(setAclSort({ selectedOption: aclState.sortOption, sector: aclState.sortSector }));
    dispatch(setAclManualPosting(aclState.manualPosting));
  };
}
