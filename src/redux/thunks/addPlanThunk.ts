import { EdstWindow } from "enums/edstWindow";
import type { Plan } from "types/plan";
import { addPlan } from "~redux/slices/planSlice";
import { openWindowThunk } from "~redux/thunks/openWindowThunk";
import type { RootThunkAction } from "~redux/store";

export const addPlanThunk = (plan: Plan): RootThunkAction => {
  return (dispatch) => {
    dispatch(openWindowThunk(EdstWindow.PLANS_DISPLAY));
    dispatch(addPlan(plan));
  };
};
