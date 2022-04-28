import * as path from "path";
import { fork, select, spawn, take, call, put } from "redux-saga/effects";
import {
  FSSandboxRootState,
  FileCache,
  FileCacheItem,
  FileCacheItemStatus
} from "./state";
import {
  fsSandboxItemLoading,
  fsSandboxItemSaving,
  fsSandboxItemLoaded,
  fsSandboxItemSaved,
  FileChanged,
  FILE_CHANGED,
  FileChangedEventType
} from "./actions";

export type FSReadResult = {
  content: Buffer;
  mimeType: string;
};

export type FSSandboxFileReader = (uri: string) => Promise<FSReadResult>;

export const setReaderMimetype = (mimeType: string, extensions: string[]) => (
  readFile: FSSandboxFileReader
) => async (uri: string) => {
  if (extensions.indexOf(path.extname(uri)) === -1) {
    return readFile(uri);
  }
  const { content } = await readFile(uri);
  return { content, mimeType };
};

export type FSSandboxOptions = {
  readFile: FSSandboxFileReader;
  writeFile(uri: string, content: Buffer): Promise<boolean>;
};

export const createFSSandboxSaga = ({
  readFile,
  writeFile
}: FSSandboxOptions) =>
  function*() {
    yield fork(function* handleFileChanges() {
      let prevState: FSSandboxRootState;
      while (1) {
        yield take();
        const state: FSSandboxRootState = yield select();
        if (prevState && state.fileCache === prevState.fileCache) {
          continue;
        }

        const updatedFiles: FileCache = {};

        for (const uri in state.fileCache) {
          if (!prevState || prevState.fileCache[uri] !== state.fileCache[uri]) {
            updatedFiles[uri] = state.fileCache[uri];
          }
        }

        prevState = state;
        for (const uri in updatedFiles) {
          yield spawn(handleUpdatedFile, updatedFiles[uri]);
        }
      }
    });

    function* handleUpdatedFile(item: FileCacheItem) {
      if (item.status === FileCacheItemStatus.CREATED) {
        yield call(loadFile, item.uri);
      } else if (item.status === FileCacheItemStatus.SAVE_REQUESTED) {
        yield call(saveFile, item);
      }
    }

    function* loadFile(uri: string) {
      yield put(fsSandboxItemLoading(uri));
      const { content, mimeType } = yield call(readFile, uri);
      yield put(fsSandboxItemLoaded(uri, content, mimeType));
    }

    function* saveFile({ uri, content }: FileCacheItem) {
      yield put(fsSandboxItemSaving(uri));
      yield call(writeFile, uri, content);
      yield put(fsSandboxItemSaved(uri));
    }

    yield fork(function* handleLocalChanges() {
      while (1) {
        const { uri }: FileChanged = yield take((action: FileChanged) => {
          return (
            action.type === FILE_CHANGED &&
            action.eventType === FileChangedEventType.CHANGE
          );
        });

        const state: FSSandboxRootState = yield select();

        // This will happen if FileChanged is fired on a FS item that isn't also in cache. I.e:
        // the changed FS item has not _explicitly_ been added via queueOpenFile
        if (!state.fileCache[uri]) {
          continue;
        }

        yield spawn(function*() {
          yield call(loadFile, uri);
        });
      }
    });
  };
