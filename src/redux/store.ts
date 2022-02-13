import {configureStore} from "@reduxjs/toolkit";
import aclReducer from './slices/aclSlice';
import depReducer from './slices/depSlice';
import sectorReducer from "./slices/sectorSlice";
import entriesReducer from "./slices/entriesSlice";

const store = configureStore({
  reducer: {
    acl: aclReducer,
    dep: depReducer,
    sectorData: sectorReducer,
    entries: entriesReducer
  },
  middleware: (getDefaultMiddleware => getDefaultMiddleware({serializableCheck: false}))
});
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
