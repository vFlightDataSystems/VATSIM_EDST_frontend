import {configureStore} from "@reduxjs/toolkit";
import aclReducer from './slices/aclSlice';
import depReducer from './slices/depSlice';
import sectorReducer from "./slices/sectorSlice";
import entriesReducer from "./slices/entriesSlice";
import planReducer from './slices/planSlice';
import appReducer from './slices/appSlice';

const store = configureStore({
  reducer: {
    app: appReducer,
    acl: aclReducer,
    dep: depReducer,
    plan: planReducer,
    sectorData: sectorReducer,
    entries: entriesReducer
  },
  middleware: (getDefaultMiddleware => getDefaultMiddleware({serializableCheck: false}))
});
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;