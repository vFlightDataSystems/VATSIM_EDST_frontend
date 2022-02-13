import {call, fork, select, put, take, takeEvery, all} from 'redux-saga/effects';
import {refreshStart, refreshStop} from "./slices/actionSlice";
import {updateEntry} from "./slices/entriesSlice";
import {fetchRefresh} from "./fetchRefresh";
import {RootState} from "./store";

function* handleRefresh() {
  const state: RootState = yield select();
  yield call(fetchRefresh, state);
}

function* watchRefresh() {
  while(true) {
    yield take(refreshStart.type);
    yield call(handleRefresh);
    yield put({type: refreshStop.type});
  }
}

function* watchUpdateEntry() {
  while(true) {
    const refreshing: boolean = yield select(state => state.action.refreshing);
    if (!refreshing) {
      yield take(updateEntry.type);
    }
  }
}

export function* rootSaga(): any {
  yield all([
    watchRefresh,
    watchUpdateEntry,
  ]);
}