import { fork, put, take, select, call } from "redux-saga/effects";
import { RootState } from "../state";
import {
  CANVAS_TOOL_PREVIEW_BUTTON_CLICKED,
  CanvasToolArtboardTitleClicked,
} from "../actions";
import { popupSaga } from "./popup";
import {
  shortcutSaga,
  ShortcutSagaOptions,
  createShortcutSaga,
} from "./shortcuts";
import { copyPasteSaga } from "./copy-paste";
import {
  getSyntheticNodeById,
  getSyntheticSourceNode,
  getPCNodeDependency,
  Frame,
} from "@paperclip-lang/core";
import { FrontEndContextOptions } from "../components/contexts";
import { processSaga } from "./process";

export type FrontEndSagaOptions = {
  openPreview(frame: Frame, state: RootState);
} & ShortcutSagaOptions &
  FrontEndContextOptions;

export const createRootSaga = (options: FrontEndSagaOptions) => {
  return function* rootSaga() {
    yield fork(copyPasteSaga);
    // yield fork(reactSaga(options));
    yield fork(popupSaga);
    yield fork(createShortcutSaga(options));
    // yield fork(PaperclipStateSaga);
    // yield fork(projectSaga(options));
    yield fork(shortcutSaga);
    yield fork(createPreviewSaga(options));
    yield fork(processSaga);
  };
};
const createPreviewSaga = ({ openPreview }: FrontEndSagaOptions) => {
  return function* previewSaga() {
    while (1) {
      const { frame }: CanvasToolArtboardTitleClicked = yield take(
        CANVAS_TOOL_PREVIEW_BUTTON_CLICKED
      );
      const state: RootState = yield select();

      const sourceNode = getSyntheticSourceNode(
        getSyntheticNodeById(frame.syntheticContentNodeId, state.documents),
        state.graph
      );
      const dep = getPCNodeDependency(sourceNode.id, state.graph);

      const opening = yield call(openPreview, frame, state);

      if (!opening) {
        // TODO - need to add instructions here
        alert(`Preview server is not currently configured`);
      }
    }
  };
};
