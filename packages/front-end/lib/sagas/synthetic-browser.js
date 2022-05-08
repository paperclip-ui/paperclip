// import { RootState } from "../state";
// import { fork, take, select, put, call, spawn } from "redux-saga/effects";
// import {
//   PROJECT_LOADED,
//   ProjectLoaded,
//   syntheticWindowOpened,
//   SyntheticWindowOpened,
//   SYNTHETIC_WINDOW_OPENED,
//   FILE_NAVIGATOR_ITEM_CLICKED,
//   DEPENDENCY_ENTRY_LOADED,
//   DependencyEntryLoaded,
//   DOCUMENT_RENDERED,
//   documentRendered,
//   RESIZER_MOVED
// } from "../actions";
// import {
//   getSyntheticWindow,
//   createSyntheticWindow,
//   SyntheticWindow,
//   renderDOM,
//   computeDisplayInfo,
//   waitForDOMReady,
//   SyntheticDocument,
//   SyntheticNativeNodeMap
// } from "paperclip";
// import { eventChannel } from "redux-saga";
// import {
//   diffArray,
//   ArrayOperationalTransformType,
//   ArrayInsertMutation,
//   ArrayUpdateMutation
// } from "tandem-common";
// export function* PaperclipStateSaga() {
//   yield fork(handleActiveWindows);
//   yield fork(handleSyntheticDocumentRootChanged);
// }
// function* handleActiveWindows() {
//   let activeWindows: SyntheticWindow[] = [];
//   while (1) {
//     yield take();
//     const state: RootState = yield select();
//     const currWindows = state.editors
//       .map(editor => getSyntheticWindow(editor.activeFilePath, state.paperclip))
//       .filter(Boolean);
//     for (const window of currWindows) {
//       if (activeWindows.indexOf(window) === -1) {
//         yield call(renderDocuments, window);
//       }
//     }
//     activeWindows = currWindows;
//   }
// }
// function* renderDocuments(window: SyntheticWindow) {
//   if (!window.documents) {
//     return;
//   }
//   for (const document of window.documents) {
//     yield fork(renderDocument, document);
//   }
// }
// function* renderDocument(document: SyntheticDocument) {
//   const body =
//     document.container.contentDocument &&
//     document.container.contentDocument.body;
//   const isRendered = body && body.childElementCount > 0;
//   if (body && isRendered) {
//     return;
//   }
//   if (!body) {
//     const doneChan = eventChannel(emit => {
//       const onDone = event => {
//         document.container.removeEventListener("load", onDone);
//         emit(event);
//       };
//       document.container.addEventListener("load", onDone);
//       return () => {};
//     });
//     yield take(doneChan);
//   }
//   const nativeMap = renderDOM(
//     document.container.contentDocument.body,
//     document.root
//   );
//   yield call(waitForDOMReady, nativeMap);
//   yield call(componentDocumentDisplayInfo, document.id, nativeMap);
// }
// function* componentDocumentDisplayInfo(
//   documentId: string,
//   nativeNodeMap: SyntheticNativeNodeMap
// ) {
//   yield put(
//     documentRendered(
//       documentId,
//       computeDisplayInfo(nativeNodeMap),
//       nativeNodeMap
//     )
//   );
// }
// function* handleSyntheticDocumentRootChanged() {
//   while (1) {
//     yield take([RESIZER_MOVED]);
//   }
// }
//# sourceMappingURL=synthetic-browser.js.map