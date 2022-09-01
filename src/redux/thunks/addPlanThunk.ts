import { addPlan } from "../slices/planSlice";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { openWindowThunk } from "./openWindowThunk";
import { RootThunkAction } from "../store";
import { Plan } from "../../typeDefinitions/types/plan";

export const addPlanThunk = (plan: Plan): RootThunkAction => {
  return dispatch => {
    dispatch(openWindowThunk(EdstWindow.PLANS_DISPLAY));
    dispatch(addPlan(plan));
  };
};
