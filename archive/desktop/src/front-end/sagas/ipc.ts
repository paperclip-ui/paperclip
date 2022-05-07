import { ipcRenderer } from "electron";
import { take, put, fork } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import { isPublicAction } from "tandem-common";

const pid = Date.now() + "_" + Math.random();

export function* ipcSaga() {
  yield fork(function*() {
    const input = eventChannel(emit => {
      ipcRenderer.on("message", (event, arg) => {
        emit(arg);
      });
      return () => {};
    });

    while (1) {
      const event = yield take(input);
      event["@@" + pid] = true;
      yield fork(function*() {
        yield put(event);
      });
    }
  });

  yield fork(function*() {
    while (1) {
      const action = yield take();
      if (isPublicAction(action) && !action["@@" + pid]) {
        ipcRenderer.send("message", action);
      }
    }
  });
}
