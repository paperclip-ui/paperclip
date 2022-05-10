import "./scss/all.scss";
import { applyMiddleware, createStore, Reducer, Action } from "redux";
import { default as createSagaMiddleware } from "redux-saga";
import { fork, call } from "redux-saga/effects";
import { rootReducer } from "./reducers";
import { createRootSaga, FrontEndSagaOptions } from "./sagas";
import { init as initBugReporting } from "./bug-reporting";

import {
  createPaperclipSaga,
  PAPERCLIP_MIME_TYPE,
  PAPERCLIP_DEFAULT_EXTENSIONS,
  PCVariant,
  getPCNodeModule,
  PCComponent,
} from "paperclip";
import { RootState, EditorWindow, getProjectCWD } from "./state";
import { appLoaded } from "./actions";
import {
  FSSandboxOptions,
  createFSSandboxSaga,
  setReaderMimetype,
} from "fsbox";
import { FrontEndContextOptions } from "./components/contexts";
import { createRemotePCRuntime } from "paperclip";
import {
  pmark,
  EMPTY_OBJECT,
  getParentTreeNode,
  memoize,
  reuser,
  EMPTY_ARRAY,
} from "tandem-common";

export type FrontEndOptions = FrontEndSagaOptions &
  FSSandboxOptions &
  FrontEndContextOptions;
export type SideEffectCreator = () => IterableIterator<FrontEndOptions>;
console.log("OK");

const SLOW_ACTION_INTERVAL = 10;

// Dirty, but okay for now. Want to eventually display a prettyier message that reports diagnostics, but
// that needs to happen _outside_ of the application's scope.

const reuseUris = reuser(10, (uris: string[]) => uris.join(","));

export const setup = (
  createSideEffects: SideEffectCreator,
  reducer?: Reducer<any>,
  saga?: () => IterableIterator<any>
) => {
  return (initialState: any) => {
    let bugReporter;

    const sagaMiddleware = createSagaMiddleware({
      onError: (e) => bugReporter.triggerError(e),
    });
    const store = createStore(
      (state: any, event: Action) => {
        const now = Date.now();
        const marker = pmark(`action ${event.type}`);
        state = rootReducer(state, event) as any;
        if (reducer) {
          state = reducer(state, event);
        }
        marker.end();

        const actionDuration = Date.now() - now;

        if (actionDuration > SLOW_ACTION_INTERVAL) {
          console.warn(
            `Action "${event.type}" took ${actionDuration}ms to execute.`
          );
        }
        return state;
      },
      initialState as any,
      applyMiddleware(sagaMiddleware)
    );

    sagaMiddleware.run(function* () {
      let {
        readFile,
        writeFile,
        openPreview,
        loadProjectInfo,
        readDirectory,
        openContextMenu,
        deleteFile,
        openFile,
      } = (yield call(createSideEffects)) as FrontEndOptions;

      readFile = setReaderMimetype(
        PAPERCLIP_MIME_TYPE,
        PAPERCLIP_DEFAULT_EXTENSIONS
      )(readFile);

      yield fork(
        createRootSaga({
          openPreview,
          loadProjectInfo,
          readDirectory,
          openContextMenu,
          deleteFile,
          openFile,
        })
      );
      if (saga) {
        yield fork(saga);
        yield fork(createFSSandboxSaga({ readFile, writeFile }));
        yield fork(
          createPaperclipSaga({
            createRuntime: () => {
              return createRemotePCRuntime(
                new Worker(new URL("./paperclip.worker", import.meta.url))
              );
            },
            getRootDirectory: (state: RootState) => {
              return getProjectCWD(state);
            },
            getPriorityUris: (state: RootState) => {
              if (!state.editorWindows.length) {
                return EMPTY_ARRAY;
              }

              return reuseUris(state.openFiles.map((openFile) => openFile.uri));
            },
            getRuntimeVariants: (state: RootState) => {
              if (!state.selectedVariant) {
                return EMPTY_OBJECT;
              }
              const module = getPCNodeModule(
                state.selectedVariant.id,
                state.graph
              );
              // variant does not exist
              if (!module) {
                return EMPTY_OBJECT;
              }
              const component = getParentTreeNode(
                state.selectedVariant.id,
                module
              ) as PCComponent;
              return getVariants(component.id, state.selectedVariant.id);
            },
          })
        );
      }
    });

    store.dispatch(appLoaded());

    bugReporter = initBugReporting(store.dispatch);
    window.onerror = bugReporter.triggerError;
  };
};

const getVariants = memoize((componentId: string, variantId: string) => ({
  [componentId]: {
    [variantId]: true,
  },
}));
export const init = (initialState: RootState) => {};

export * from "./state";
export * from "./actions";
export * from "paperclip";
export * from "./starter-kits";
export * from "./sagas/process";
