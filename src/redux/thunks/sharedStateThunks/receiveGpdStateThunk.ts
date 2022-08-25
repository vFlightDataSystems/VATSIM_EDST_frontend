import { SharedGpdState } from "../../../typeDefinitions/types/sharedStateTypes/sharedGpdState";
import { RootThunkAction } from "../../store";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { closeWindow, openWindow, pushZStack } from "../../slices/appSlice";

export function receiveGpdStateThunk(gpdState: SharedGpdState): RootThunkAction {
  return (dispatch, getState) => {
    const gpdWindow = getState().app.windows[EdstWindow.GPD];
    if (gpdState.open) {
      if (gpdWindow.open) {
        dispatch(pushZStack(EdstWindow.GPD));
      } else {
        dispatch(openWindow(EdstWindow.GPD));
      }
    } else {
      dispatch(closeWindow(EdstWindow.GPD));
    }
  };
}
