import { fork, select, take, put, spawn, call } from "redux-saga/effects";
import { eventChannel, delay } from "redux-saga";
import { unloading, UNLOADER_COMPLETED, UNLOADING, RELOAD } from "../actions";
import { isUnloaded } from "../state";

export function* processSaga() {
  yield fork(handleWindowReload);
}

function* handleWindowReload() {
  yield take(RELOAD);
  yield call(unloadApplication, function* () {
    window.location.reload();
  });
}

export function* unloadApplication(
  handleUnloaded: () => IterableIterator<any>
) {
  yield spawn(function* () {
    while (1) {
      yield take([UNLOADER_COMPLETED, UNLOADING]);

      // delay so that unloaders have time to register to state
      yield delay(0);
      if (isUnloaded(yield select())) {
        break;
      }
    }
    yield call(handleUnloaded);
  });

  yield put(unloading());
}
