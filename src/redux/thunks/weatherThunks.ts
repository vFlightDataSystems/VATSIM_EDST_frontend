import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootThunkAction } from "../store";
import { addSigmets } from "../slices/weatherSlice";
import { fetchSigmets } from "../../api/api";

export const refreshSigmets = createAsyncThunk("weather/refreshSigmets", async (_args, thunkAPI) => {
  // const sectors = (thunkAPI.getState() as RootState).sectorData.sectors;
  await fetchSigmets().then(sigmetEntries => {
    thunkAPI.dispatch(addSigmets(sigmetEntries.reverse()));
  });
});

export const refreshWeatherThunk: RootThunkAction = (dispatch) => {
  dispatch(refreshSigmets());
};
