import { fork, select, take } from "redux-saga/effects";
import { RootState, Confirm } from "../state";

export function* popupSaga() {
  yield fork(handleConfirm);
}

export function* handleConfirm() {
  let prevConfirm: Confirm;
  while (1) {
    yield take();
    const confirm = yield select((state: RootState) => state.confirm);

    if (prevConfirm === confirm) {
      continue;
    }
    prevConfirm = confirm;
    alert(confirm.message);
  }
}
