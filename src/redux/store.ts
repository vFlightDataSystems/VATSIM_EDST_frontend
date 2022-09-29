import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import aclReducer from "./slices/aclSlice";
import depReducer from "./slices/depSlice";
import gpdReducer from "./slices/gpdSlice";
import sectorReducer from "./slices/sectorSlice";
import entryReducer from "./slices/entrySlice";
import planReducer from "./slices/planSlice";
import appReducer from "./slices/appSlice";
import aircraftTrackReducer from "./slices/trackSlice";
import weatherReducer from "./slices/weatherSlice";
import windowOptionsReducer from "./slices/windowOptionsSlice";
import authReducer from "./slices/authSlice";
import { prefrouteApi } from "../api/prefrouteApi";
import { aircraftApi } from "../api/aircraftApi";
import { weatherApi } from "../api/weatherApi";
import { gpdApi } from "../api/gpdApi";

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
    [gpdApi.reducerPath]: gpdApi.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }).concat([prefrouteApi.middleware, aircraftApi.middleware, weatherApi.middleware])
});
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;
export type RootThunkAction<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
