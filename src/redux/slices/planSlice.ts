import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store";

export enum PlanQueryType {
  direct = 'direct',
  reroute = 'reroute',
  alt = 'alt',
  tempAlt = 'tempAlt',
  hold = 'hold',
  cancelHold = 'cancelHold'
}

export type PlanType = {
  cid: string,
  callsign: string,
  planData: Record<string, any>,
  queryType: PlanQueryType,
  msg?: string,
  dest?: string
}

export type PlanStateType = {
  planQueue: PlanType[],
  selectedPlanIndex: number | null
};

const initialState = {
  planQueue: [],
  selectedPlanIndex: null
};

const planSlice = createSlice({
  name: 'plan',
  initialState: initialState as PlanStateType,
  reducers: {
    addTrialPlan(state, action: {payload: PlanType}) {
      state.planQueue.unshift(action.payload);
      state.selectedPlanIndex = 0;
    },
    removeTrialPlan(state, action: {payload: number}) {
      if (action.payload < state.planQueue.length) {
        state.selectedPlanIndex = null;
        state.planQueue.splice(action.payload, 1);
      }
    },
    planCleanup(state) {
      state.planQueue = [];
      state.selectedPlanIndex = null;
    },
    setSelectedTrialPlanIndex(state, action: {payload: number | null}) {
      state.selectedPlanIndex = action.payload;
    }
  }
});

export const {addTrialPlan, removeTrialPlan, setSelectedTrialPlanIndex, planCleanup} = planSlice.actions;
export default planSlice.reducer;

export const selectedPlanIndexSelector = (state: RootState) => state.plan.selectedPlanIndex;
export const planQueueSelector = (state: RootState) => state.plan.planQueue;