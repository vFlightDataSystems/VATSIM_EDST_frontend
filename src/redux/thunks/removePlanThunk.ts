import { EdstWindow } from "enums/edstWindow";
import type { RootThunkAction } from "../store";
import { removePlan } from "../slices/planSlice";
import { closeWindow } from "../slices/appSlice";

export function removePlanThunk(index: number): RootThunkAction {
  return (dispatch, getState) => {
    dispatch(removePlan(index));
    if (getState().plan.planQueue.length === 0) {
      dispatch(closeWindow(EdstWindow.PLANS_DISPLAY));
    }
  };
}
