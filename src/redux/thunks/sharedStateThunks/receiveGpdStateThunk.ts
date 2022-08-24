import { SharedGpdState } from "../../../types/sharedStateTypes/sharedGpdState";
import { RootThunkAction } from "../../store";
import { EdstWindow } from "../../../enums/edstWindow";
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
