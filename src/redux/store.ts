import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import { prefrouteApi } from "~/api/prefrouteApi";
import { aircraftApi } from "~/api/aircraftApi";
import { weatherApi } from "~/api/weatherApi";
import { gpdApi } from "~/api/gpdApi";
import aclReducer from "~redux/slices/aclSlice";
import depReducer from "~redux/slices/depSlice";
import gpdReducer from "~redux/slices/gpdSlice";
import sectorReducer from "~redux/slices/sectorSlice";
import entryReducer from "~redux/slices/entrySlice";
import planReducer from "~redux/slices/planSlice";
import appReducer from "~redux/slices/appSlice";
import aircraftTrackReducer from "~redux/slices/trackSlice";
import weatherReducer from "~redux/slices/weatherSlice";
import windowOptionsReducer from "~redux/slices/windowOptionsSlice";
import authReducer from "~redux/slices/authSlice";

const store = configureStore({
  reducer: {
    app: appReducer,
    acl: aclReducer,
    dep: depReducer,
    gpd: gpdReducer,
    plan: planReducer,
    sectorData: sectorReducer,
    entries: entryReducer,
    aircraftTracks: aircraftTrackReducer,
    weather: weatherReducer,
    windowOptions: windowOptionsReducer,
    auth: authReducer,
    [prefrouteApi.reducerPath]: prefrouteApi.reducer,
    [aircraftApi.reducerPath]: aircraftApi.reducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
    [gpdApi.reducerPath]: gpdApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat([
      prefrouteApi.middleware,
      aircraftApi.middleware,
      weatherApi.middleware,
      gpdApi.middleware,
    ]),
});
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;
export type RootThunkAction<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
