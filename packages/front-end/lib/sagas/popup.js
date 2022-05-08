import { fork, select, take } from "redux-saga/effects";
export function* popupSaga() {
    yield fork(handleConfirm);
}
export function* handleConfirm() {
    let prevConfirm;
    while (1) {
        yield take();
        const confirm = yield select((state) => state.confirm);
        if (prevConfirm === confirm) {
            continue;
        }
        prevConfirm = confirm;
        alert(confirm.message);
    }
}
//# sourceMappingURL=popup.js.map