import { createAsyncThunk } from "@reduxjs/toolkit";
import { addPlan } from "../slices/planSlice";
import { openWindow } from "../slices/appSlice";
import { EdstWindow } from "../../enums/edstWindow";
import { Plan } from "../../types/plan";

export const addPlanThunk = createAsyncThunk<void, Plan>("plan/trial/route", async (plan, thunkAPI) => {
  thunkAPI.dispatch(addPlan(plan));
  thunkAPI.dispatch(openWindow({ window: EdstWindow.PLANS_DISPLAY }));
});
