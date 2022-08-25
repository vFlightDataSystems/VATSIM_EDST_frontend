import { SharedAclState } from "../../../typeDefinitions/types/sharedStateTypes/sharedAclState";
import { RootThunkAction } from "../../store";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { setAclManualPosting, setAclSort } from "../../slices/aclSlice";
import { closeWindow, openWindow, pushZStack } from "../../slices/appSlice";

export function receiveAclStateThunk(aclState: SharedAclState): RootThunkAction {
  return (dispatch, getState) => {
    const aclWindow = getState().app.windows[EdstWindow.ACL];
    dispatch(setAclSort({ selectedOption: aclState.sortOption, sector: aclState.sortSector }));
    dispatch(setAclManualPosting(aclState.manualPosting));
    if (aclState.open) {
      if (aclWindow.open) {
        dispatch(pushZStack(EdstWindow.ACL));
      } else {
        dispatch(openWindow(EdstWindow.ACL));
      }
    } else {
      dispatch(closeWindow(EdstWindow.ACL));
    }
  };
}
