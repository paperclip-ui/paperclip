import { eventChannel } from "redux-saga";
import { fork, take, select, put } from "redux-saga/effects";
import { getInspectorNodeClipboardData } from "../state";
import { xmlToPCNode } from "paperclip";
import { inspectorNodePasted } from "../actions";
export function* copyPasteSaga() {
    yield fork(handleCopy);
    yield fork(handlePaste);
}
function* handleCopy() {
    while (1) {
        const chan = eventChannel(emit => {
            document.addEventListener("copy", (event) => {
                if (document.activeElement &&
                    /input|textarea/i.test(document.activeElement.tagName)) {
                    return;
                }
                emit(event);
            });
            return () => { };
        });
        while (1) {
            const event = yield take(chan);
            const root = yield select();
            event.clipboardData.setData("text/plain", JSON.stringify(getInspectorNodeClipboardData(root)));
            event.preventDefault();
        }
    }
}
function* handlePaste() {
    while (1) {
        const chan = eventChannel(emit => {
            document.addEventListener("paste", (event) => {
                emit(event);
                // TODO - emit paste
            });
            return () => { };
        });
        while (1) {
            const event = yield take(chan);
            const text = event.clipboardData.getData("text/plain");
            // paperclip first
            try {
                const clips = JSON.parse(text);
                yield put(inspectorNodePasted(clips));
                event.preventDefault();
                continue;
            }
            catch (e) {
                console.warn(e);
            }
            // XML next
            try {
                const node = xmlToPCNode(text);
                const clips = [
                    {
                        node
                    }
                ];
                yield put(inspectorNodePasted(clips));
                event.preventDefault();
                continue;
            }
            catch (e) { }
        }
    }
}
//# sourceMappingURL=copy-paste.js.map