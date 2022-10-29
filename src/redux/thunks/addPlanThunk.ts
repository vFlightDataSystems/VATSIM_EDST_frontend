import { EdstWindow } from "enums/edstWindow";
import type { Plan } from "types/plan";
import { addPlan } from "../slices/planSlice";
import { openWindowThunk } from "./openWindowThunk";
import type { RootThunkAction } from "../store";

export const addPlanThunk = (plan: Plan): RootThunkAction => {
  return (dispatch) => {
    dispatch(openWindowThunk(EdstWindow.PLANS_DISPLAY));
    dispatch(addPlan(plan));
  };
};
