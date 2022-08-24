import { SharedPlansDisplayState } from "../../../types/sharedStateTypes/sharedPlansDisplayState";
import { RootThunkAction } from "../../store";
import { EdstWindow } from "../../../enums/edstWindow";
import { setPlanQueue } from "../../slices/planSlice";
import { closeWindow, openWindow, pushZStack } from "../../slices/appSlice";

export function receivePlansDisplayStateThunk(plansDisplayState: SharedPlansDisplayState): RootThunkAction {
  return (dispatch, getState) => {
    const plansDisplayWindow = getState().app.windows[EdstWindow.PLANS_DISPLAY];
    dispatch(setPlanQueue(plansDisplayState.planQueue));
    if (plansDisplayState.open) {
      if (plansDisplayWindow.open) {
        dispatch(pushZStack(EdstWindow.PLANS_DISPLAY));
      } else {
        dispatch(openWindow(EdstWindow.PLANS_DISPLAY));
      }
    } else {
      dispatch(closeWindow(EdstWindow.PLANS_DISPLAY));
    }
  };
}
