import { SharedPlansDisplayState } from "../../../types/sharedStateTypes/sharedPlansDisplayState";
import { RootThunkAction } from "../../store";
import { EdstWindow } from "../../../enums/edstWindow";
import { setPlanQueue } from "../../slices/planSlice";
import { closeWindow, openWindow } from "../../slices/appSlice";

export function receivePlansDisplayStateThunk(plansDisplayState: SharedPlansDisplayState): RootThunkAction {
  return (dispatch, getState) => {
    const plansDisplayWindow = getState().app.windows[EdstWindow.PLANS_DISPLAY];
    dispatch(setPlanQueue(plansDisplayState.planQueue));
    if (plansDisplayWindow.open && !plansDisplayState.open) {
      dispatch(closeWindow(EdstWindow.PLANS_DISPLAY));
    } else if (!plansDisplayWindow.open && plansDisplayState.open) {
      dispatch(openWindow(EdstWindow.PLANS_DISPLAY));
    }
  };
}
