import { SharedDepState } from "../../../typeDefinitions/types/sharedStateTypes/sharedDepState";
import { RootThunkAction } from "../../store";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { setDepSort } from "../../slices/depSlice";
import { setAclManualPosting } from "../../slices/aclSlice";
import { closeWindow, openWindow, pushZStack } from "../../slices/appSlice";

export function receiveDepStateThunk(depState: SharedDepState): RootThunkAction {
  return (dispatch, getState) => {
    const depWindow = getState().app.windows[EdstWindow.DEP];
    dispatch(setDepSort(depState.sortOption));
    dispatch(setAclManualPosting(depState.manualPosting));
    if (depState.open) {
      if (depWindow.open) {
        dispatch(pushZStack(EdstWindow.DEP));
      } else {
        dispatch(openWindow(EdstWindow.DEP));
      }
    } else {
      dispatch(closeWindow(EdstWindow.DEP));
    }
  };
}
