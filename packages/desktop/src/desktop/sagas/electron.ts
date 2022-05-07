import { fork, call, take, put } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import { app } from "electron";
import { appReady } from "../actions";

export function* electronSaga() {
  yield fork(onAppReady);
}

function* onAppReady() {
  const chan = eventChannel(emit => {
    app.on("ready", event => {
      emit(event);
    });
    return () => {};
  });

  yield take(chan);
  yield put(appReady());
}
