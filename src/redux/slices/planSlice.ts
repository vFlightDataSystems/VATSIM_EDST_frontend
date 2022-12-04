import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import type { Nullable } from "types/utility-types";
import type { Plan } from "types/plan";
import type { RootState } from "~redux/store";
import sharedSocket from "~socket";

export type PlanState = {
  planQueue: Plan[];
  selectedPlanIndex: Nullable<number>;
};

const initialState: PlanState = {
  planQueue: [],
  selectedPlanIndex: null,
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
    setSelectedPlanIndex(state, action: PayloadAction<Nullable<number>>) {
      if (action.payload === null || (action.payload >= 0 && action.payload < state.planQueue.length)) {
        state.selectedPlanIndex = action.payload;
      }
      sharedSocket.setPlanState(state);
    },
  },
});

export const { setPlanState, addPlan, removePlan, setSelectedPlanIndex, planCleanup } = planSlice.actions;
export default planSlice.reducer;

export const selectedPlanIndexSelector = (state: RootState) => state.plan.selectedPlanIndex;
export const planQueueSelector = (state: RootState) => state.plan.planQueue;
