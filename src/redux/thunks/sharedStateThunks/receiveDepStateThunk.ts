import { SharedDepState } from "../../../types/sharedStateTypes/sharedDepState";
import { RootThunkAction } from "../../store";
import { EdstWindow } from "../../../enums/edstWindow";
import { setDepSort } from "../../slices/depSlice";
import { setAclManualPosting } from "../../slices/aclSlice";
import { closeWindow, openWindow } from "../../slices/appSlice";

export function receiveDepStateThunk(depState: SharedDepState): RootThunkAction {
  return (dispatch, getState) => {
    const depWindow = getState().app.windows[EdstWindow.DEP];
    dispatch(setDepSort(depState.sortOption));
    dispatch(setAclManualPosting(depState.manualPosting));
    if (depWindow.open && !depState.open) {
      dispatch(closeWindow(EdstWindow.DEP));
    } else if (!depWindow.open && depState.open) {
      dispatch(openWindow(EdstWindow.DEP));
    }
  };
}
