import { fork, take, select, call } from "redux-saga/effects";
import { reactSaga } from "./react";
import { CANVAS_TOOL_PREVIEW_BUTTON_CLICKED } from "../actions";
import { popupSaga } from "./popup";
import { projectSaga } from "./project";
import { shortcutSaga, createShortcutSaga } from "./shortcuts";
import { copyPasteSaga } from "./copy-paste";
import { getSyntheticNodeById, getSyntheticSourceNode, getPCNodeDependency } from "paperclip";
import { processSaga } from "./process";
export const createRootSaga = (options) => {
    return function* rootSaga() {
        yield fork(copyPasteSaga);
        yield fork(reactSaga(options));
        yield fork(popupSaga);
        yield fork(createShortcutSaga(options));
        // yield fork(PaperclipStateSaga);
        yield fork(projectSaga(options));
        yield fork(shortcutSaga);
        yield fork(createPreviewSaga(options));
        yield fork(processSaga);
    };
};
const createPreviewSaga = ({ openPreview }) => {
    return function* previewSaga() {
        while (1) {
            const { frame } = yield take(CANVAS_TOOL_PREVIEW_BUTTON_CLICKED);
            const state = yield select();
            const sourceNode = getSyntheticSourceNode(getSyntheticNodeById(frame.syntheticContentNodeId, state.documents), state.graph);
            const dep = getPCNodeDependency(sourceNode.id, state.graph);
            const opening = yield call(openPreview, frame, state);
            if (!opening) {
                // TODO - need to add instructions here
                alert(`Preview server is not currently configured`);
            }
        }
    };
};
//# sourceMappingURL=index.js.map