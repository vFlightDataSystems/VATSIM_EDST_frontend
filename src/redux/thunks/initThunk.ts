import { createAsyncThunk } from "@reduxjs/toolkit";
import { refreshSigmets } from "./weatherThunks";

export const initThunk = createAsyncThunk("app/init", async (_args, thunkAPI) => {
  thunkAPI.dispatch(refreshSigmets());
});
