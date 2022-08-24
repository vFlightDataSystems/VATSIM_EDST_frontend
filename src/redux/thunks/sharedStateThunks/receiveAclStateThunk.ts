import { SharedAclState } from "../../../types/sharedStateTypes/sharedAclState";
import { RootThunkAction } from "../../store";
import { EdstWindow } from "../../../enums/edstWindow";
import { setAclManualPosting, setAclSort } from "../../slices/aclSlice";
import { closeWindow, openWindow } from "../../slices/appSlice";

export function receiveAclStateThunk(aclState: SharedAclState): RootThunkAction {
  return (dispatch, getState) => {
    const aclWindow = getState().app.windows[EdstWindow.ACL];
    dispatch(setAclSort({ selectedOption: aclState.sortOption, sector: aclState.sortSector }));
    dispatch(setAclManualPosting(aclState.manualPosting));
    if (aclWindow.open && !aclState.open) {
      dispatch(closeWindow(EdstWindow.ACL));
    } else if (!aclWindow.open && aclState.open) {
      dispatch(openWindow(EdstWindow.ACL));
    }
  };
}
