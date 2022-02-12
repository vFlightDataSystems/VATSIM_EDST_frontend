import {aclReducer} from './reducers/aclReducer';
import {depReducer} from './reducers/depReducer';
import {sectorReducer} from "./reducers/sectorReducer";
import {configureStore} from "@reduxjs/toolkit";
import {entriesReducer} from "./reducers/entriesReducer";

const asyncFunctionMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
  // If the "action" is actually a function instead...
  if (typeof action === 'function') {
    // then call the function and pass `dispatch` and `getState` as arguments
    return action(storeAPI.dispatch, storeAPI.getState);
  }

  // Otherwise, it's a normal action - send it onwards
  return next(action);
};

const store = configureStore({
  reducer: {
    acl: aclReducer,
    dep: depReducer,
    sectorData: sectorReducer,
    entries: entriesReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(asyncFunctionMiddleware)
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
