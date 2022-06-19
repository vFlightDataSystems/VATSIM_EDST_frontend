import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Flightplan } from "../../types";

export type TrialPlan = {
  cid: string;
  aircraftId: string;
  amendedFlightplan: Flightplan;
  commandString: string;
  expirationTime: number; // unix time in seconds (return value from new Date().getTime()
};

export type PlanState = {
  planQueue: TrialPlan[];
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
    addTrialPlan(state, action: PayloadAction<TrialPlan>) {
      state.planQueue.unshift(action.payload);
      state.selectedPlanIndex = 0;
    },
    removeTrialPlan(state, action: PayloadAction<number>) {
      if (action.payload < state.planQueue.length) {
        state.selectedPlanIndex = null;
        state.planQueue.splice(action.payload, 1);
      }
    },
    planCleanup(state) {
      state.planQueue = [];
      state.selectedPlanIndex = null;
    },
    setSelectedTrialPlanIndex(state, action: PayloadAction<number | null>) {
      state.selectedPlanIndex = action.payload;
    }
  }
});

export const { addTrialPlan, removeTrialPlan, setSelectedTrialPlanIndex, planCleanup } = planSlice.actions;
export default planSlice.reducer;

export const selectedPlanIndexSelector = (state: RootState) => state.plan.selectedPlanIndex;
export const planQueueSelector = (state: RootState) => state.plan.planQueue;
