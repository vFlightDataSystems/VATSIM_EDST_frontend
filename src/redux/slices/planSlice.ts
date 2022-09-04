import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { RootState } from "../store";
import { Plan } from "../../typeDefinitions/types/plan";
import sharedSocket from "../../sharedState/socket";

export type PlanState = {
  planQueue: Plan[];
  selectedPlanIndex: number | null;
};

const initialState: PlanState = {
  planQueue: [],
  selectedPlanIndex: null
};

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    setPlanState(state, action: PayloadAction<PlanState>) {
      _.assign(state, action.payload);
    },
    addPlan(state, action: PayloadAction<Plan>) {
      state.planQueue.unshift(action.payload);
      state.selectedPlanIndex = 0;
      sharedSocket.setPlanState(state);
    },
    removePlan(state, action: PayloadAction<number>) {
      if (action.payload >= 0 && action.payload < state.planQueue.length) {
        state.selectedPlanIndex = null;
        state.planQueue.splice(action.payload, 1);
        sharedSocket.setPlanState(state);
      }
    },
    planCleanup() {
      sharedSocket.setPlanState(initialState);
      return initialState;
    },
    setSelectedPlanIndex(state, action: PayloadAction<number | null>) {
      if (action.payload === null || (action.payload >= 0 && action.payload < state.planQueue.length)) {
        state.selectedPlanIndex = action.payload;
      }
      sharedSocket.setPlanState(state);
    }
  }
});

export const { setPlanState, addPlan, removePlan, setSelectedPlanIndex, planCleanup } = planSlice.actions;
export default planSlice.reducer;

export const selectedPlanIndexSelector = (state: RootState) => state.plan.selectedPlanIndex;
export const planQueueSelector = (state: RootState) => state.plan.planQueue;
