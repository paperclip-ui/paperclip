// import { eventChannel } from "redux-saga";
// import { take, fork, select, call, put, spawn } from "redux-saga/effects";
// import {
//   pcFrameRendered,
//   pcFrameContainerCreated,
//   pcRuntimeEvaluated,
//   PC_RUNTIME_EVALUATED,
//   PCRuntimeEvaluated
// } from "./actions";
// import {
//   SyntheticNativeNodeMap,
//   renderDOM,
//   patchDOM,
//   computeDisplayInfo
// } from "./dom-renderer";
// import {
//   KeyValue,
//   getNestedTreeNodeById,
//   EMPTY_ARRAY,
//   pmark,
//   memoize
// } from "tandem-common";
// import { DependencyGraph } from "./graph";
// import { TreeNodeOperationalTransform } from "./ot";
// import { PCEditorState, Frame, getSyntheticDocumentFrames } from "./edit";
// import {
//   SyntheticNode,
//   getSyntheticNodeById,
//   SyntheticDocument,
//   SyntheticVisibleNode,
//   getSyntheticDocumentByDependencyUri
// } from "./synthetic";
// import { PCRuntime, LocalRuntimeInfo } from "./runtime";
// import { fsCacheBusy } from "fsbox";

// export type PaperclipSagaOptions = {
//   createRuntime(): PCRuntime;
//   getPriorityUris(state: PCEditorState): string[];
//   getRootDirectory(state: PCEditorState): string;
//   getRuntimeVariants(state: PCEditorState): KeyValue<KeyValue<boolean>>;
// };

// const getRuntimeInfo = memoize(
//   (
//     graph: DependencyGraph,
//     rootDirectory: string,
//     variants: KeyValue<KeyValue<boolean>>,
//     priorityUris: string[]
//   ): LocalRuntimeInfo => {
//     return {
//       graph,
//       rootDirectory,
//       variants,
//       priorityUris
//     };
//   }
// );

// export const createPaperclipSaga = ({
//   createRuntime,
//   getRuntimeVariants,
//   getPriorityUris,
//   getRootDirectory
// }: PaperclipSagaOptions) =>
//   function* paperclipSaga() {
//     yield fork(runtime);
//     yield fork(nativeRenderer);

//     function* runtime() {
//       const rt = createRuntime();

//       const chan = eventChannel(emit => {
//         rt.on(
//           "evaluate",
//           (newDocuments, diffs, deletedDocumentIds, timestamp) => {
//             emit(
//               pcRuntimeEvaluated(
//                 newDocuments,
//                 diffs,
//                 rt.syntheticDocuments,
//                 timestamp < rt.lastUpdatedAt
//               )
//             );
//           }
//         );
//         return () => {};
//       });

//       yield fork(function*() {
//         while (1) {
//           yield put(yield take(chan));
//         }
//       });

//       let graph;

//       while (1) {
//         yield take();
//         const state: PCEditorState = yield select();
//         if (fsCacheBusy(state.fileCache)) {
//           continue;
//         }

//         if (graph !== state.graph) {
//           graph = state.graph;
//         }

//         rt.setInfo(
//           getRuntimeInfo(
//             state.graph,
//             getRootDirectory(state),
//             getRuntimeVariants(state),
//             getPriorityUris(state)
//           )
//         );
//       }
//     }

//     let initedFrames = {};

//     function* nativeRenderer() {
//       yield fork(function* captureFrameChanges() {
//         let prevState: PCEditorState;
//         while (1) {
//           const { diffs }: PCRuntimeEvaluated = yield take(
//             PC_RUNTIME_EVALUATED
//           );
//           const marker = pmark(`*nativeRenderer()`);
//           const state: PCEditorState = yield select();

//           const allDocUris = Object.keys(state.graph);

//           for (const uri of allDocUris) {
//             const newDocument = getSyntheticDocumentByDependencyUri(
//               uri,
//               state.documents,
//               state.graph
//             );

//             if (!newDocument) {
//               continue;
//             }

//             const ots = diffs[uri] || EMPTY_ARRAY;

//             for (const newFrame of getSyntheticDocumentFrames(
//               newDocument,
//               state.frames
//             )) {
//               // container may not exist of project is reloaded
//               if (
//                 !initedFrames[newFrame.syntheticContentNodeId] ||
//                 !newFrame.$container
//               ) {
//                 initedFrames[newFrame.syntheticContentNodeId] = true;
//                 yield spawn(initContainer, newFrame, state.graph);
//               } else {
//                 const frameOts = mapContentNodeOperationalTransforms(
//                   newFrame.syntheticContentNodeId,
//                   newDocument,
//                   ots
//                 );
//                 const oldFrame =
//                   prevState &&
//                   prevState.frames.find(
//                     oldFrame =>
//                       oldFrame.syntheticContentNodeId ===
//                       newFrame.syntheticContentNodeId
//                   );

//                 // Equality check on bounds since that's the only prop needed for re-rendering the frame. Equality check
//                 // should !!NOT!! happen between frames (oldFrame !== newFrame) since patchContainer emits computed data
//                 // that updates the frame which would result in prevState to be out of sync.
//                 if (
//                   frameOts.length ||
//                   (!oldFrame || oldFrame.bounds !== newFrame.bounds)
//                 ) {
//                   const oldDocument = getSyntheticDocumentByDependencyUri(
//                     uri,
//                     prevState.documents,
//                     prevState.graph
//                   );

//                   yield spawn(
//                     patchContainer,
//                     newFrame,
//                     getNestedTreeNodeById(
//                       newFrame.syntheticContentNodeId,
//                       oldDocument
//                     ) as SyntheticNode,
//                     frameOts
//                   );
//                 }
//               }
//             }
//           }

//           marker.end();

//           prevState = state;
//         }
//       });
//     }

//     const mapContentNodeOperationalTransforms = (
//       syntheticContentNodeId: string,
//       document: SyntheticDocument,
//       ots: TreeNodeOperationalTransform[]
//     ) => {
//       const index = document.children.findIndex(
//         child => child.id === syntheticContentNodeId
//       );
//       return ots.filter(ot => ot.nodePath[0] === index).map(ot => ({
//         ...ot,
//         nodePath: ot.nodePath.slice(1)
//       }));
//     };

//     const frameNodeMap: KeyValue<SyntheticNativeNodeMap> = {};

//     function* initContainer(frame: Frame, graph: DependencyGraph) {
//       const container = createContainer();

//       // notify of the new container
//       yield put(pcFrameContainerCreated(frame, container));
//       yield call(watchContainer, container, frame, graph);
//     }

//     // FIXME: This produces memory leaks when frames are removed from the store.
//     function* watchContainer(container: HTMLElement, frame: Frame) {
//       const iframe = container.children[0] as HTMLIFrameElement;

//       if (!iframe) {
//         return;
//       }
//       // wait until it's been mounted, then continue
//       const eventChan = eventChannel(emit => {
//         const onUnload = () => {
//           iframe.contentWindow.removeEventListener("unload", onUnload);
//           resetContainer(container);
//           emit("unload");
//         };
//         const onDone = () => {
//           if (iframe.contentWindow) {
//             iframe.contentWindow.addEventListener("unload", onUnload);
//           }
//           iframe.removeEventListener("load", onDone);
//           emit("load");
//         };

//         iframe.addEventListener("load", onDone);
//         if (iframe.contentDocument && iframe.contentDocument.body) {
//           setImmediate(onDone);
//         }

//         return () => {};
//       });

//       while (1) {
//         const eventType = yield take(eventChan);
//         if (eventType === "load") {
//           const state: PCEditorState = yield select();
//           const contentNode = getSyntheticNodeById(
//             frame.syntheticContentNodeId,
//             state.documents
//           );
//           const graph = state.graph;

//           // happens on reload
//           if (!iframe.contentDocument) {
//             continue;
//           }
//           const body = iframe.contentDocument.body;
//           yield put(
//             pcFrameRendered(
//               frame,
//               computeDisplayInfo(
//                 (frameNodeMap[frame.syntheticContentNodeId] = renderDOM(
//                   body,
//                   contentNode
//                 ))
//               )
//             )
//           );
//         } else if (eventType === "unload") {
//           break;
//         }
//       }

//       yield call(watchContainer, container, frame);
//     }

//     function* patchContainer(
//       frame: Frame,
//       contentNode: SyntheticVisibleNode,
//       ots: TreeNodeOperationalTransform[]
//     ) {
//       const marker = pmark(`*patchContainer()`);
//       const container: HTMLElement = frame.$container;
//       const iframe = container.children[0] as HTMLIFrameElement;
//       const body = iframe.contentDocument && iframe.contentDocument.body;
//       if (!body) {
//         marker.end();
//         return;
//       }

//       frameNodeMap[frame.syntheticContentNodeId] = patchDOM(
//         ots,
//         contentNode,
//         body,
//         frameNodeMap[frame.syntheticContentNodeId]
//       );

//       yield put(
//         pcFrameRendered(
//           frame,
//           computeDisplayInfo(frameNodeMap[frame.syntheticContentNodeId])
//         )
//       );

//       marker.end();
//     }
//   };

// const createContainer = () => {
//   if (typeof window === "undefined") return null;
//   const container = document.createElement("div");
//   container.appendChild(createIframe());
//   return container;
// };

// const resetContainer = (container: HTMLElement) => {
//   container.removeChild(container.children[0]);
//   container.appendChild(createIframe());
// };

// const createIframe = () => {
//   const iframe = document.createElement("iframe");
//   iframe.style.width = "100%";
//   iframe.style.height = "100%";
//   iframe.style.background = "white";
//   iframe.addEventListener("load", () => {
//     iframe.contentDocument.body.style.margin = "0";
//   });
//   return iframe;
// };
