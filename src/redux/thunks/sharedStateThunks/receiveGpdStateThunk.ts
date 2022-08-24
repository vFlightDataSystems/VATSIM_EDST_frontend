import { SharedGpdState } from "../../../types/sharedStateTypes/sharedGpdState";
import { RootThunkAction } from "../../store";
import { EdstWindow } from "../../../enums/edstWindow";
import { closeWindow, openWindow } from "../../slices/appSlice";

export function receiveGpdStateThunk(gpdState: SharedGpdState): RootThunkAction {
  return (dispatch, getState) => {
    const gpdWindow = getState().app.windows[EdstWindow.GPD];
    if (gpdWindow.open && !gpdState.open) {
      dispatch(closeWindow(EdstWindow.GPD));
    } else if (!gpdWindow.open && gpdState.open) {
      dispatch(openWindow(EdstWindow.GPD));
    }
  };
}
