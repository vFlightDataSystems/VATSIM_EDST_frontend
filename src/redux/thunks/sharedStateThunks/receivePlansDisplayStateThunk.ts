import { SharedPlansDisplayState } from "../../../typeDefinitions/types/sharedStateTypes/sharedPlansDisplayState";
import { RootThunkAction } from "../../store";
import { setPlanQueue } from "../../slices/planSlice";

export function receivePlansDisplayStateThunk(plansDisplayState: SharedPlansDisplayState): RootThunkAction {
  return dispatch => {
    dispatch(setPlanQueue(plansDisplayState.planQueue));
  };
}
