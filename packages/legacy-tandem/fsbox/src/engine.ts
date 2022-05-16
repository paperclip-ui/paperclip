import { Action, Dispatch } from "redux";
import { EngineActionHandler } from "tandem-common";
import { FSSandboxEngineOptions } from "./base";
import {
  FileChanged,
  FileChangedEventType,
  FILE_CHANGED,
  fsSandboxItemLoaded,
  fsSandboxItemLoading,
  fsSandboxItemSaved,
  fsSandboxItemSaving,
} from "./actions";
import {
  FileCache,
  FileCacheItem,
  FileCacheItemStatus,
  FSSandboxRootState,
} from "./state";

export const startFSBoxEngine =
  ({ readFile, writeFile }: FSSandboxEngineOptions) =>
  (dispatch: Dispatch<Action>) => {
    const loadFile = async (uri: string) => {
      dispatch(fsSandboxItemLoading(uri));
      const { content, mimeType } = await readFile(uri);
      dispatch(fsSandboxItemLoaded(uri, content, mimeType));
    };

    const handleFileChanged = (
      { uri }: FileChanged,
      state: FSSandboxRootState
    ) => {
      if (!state.fileCache[uri]) {
        return;
      }

      loadFile(uri);
    };

    const handleUpdatedFile = async (item: FileCacheItem) => {
      if (item.status === FileCacheItemStatus.CREATED) {
        await loadFile(item.uri);
      } else if (item.status === FileCacheItemStatus.SAVE_REQUESTED) {
        await saveFile(item);
      }
    };

    const saveFile = async ({ uri, content }: FileCacheItem) => {
      dispatch(fsSandboxItemSaving(uri));
      await writeFile(uri, content);
      dispatch(fsSandboxItemSaved(uri));
    };

    const fileChangedHandler = (action: Action, state: FSSandboxRootState) => {
      if (
        action.type === FILE_CHANGED &&
        (action as FileChanged).type === FileChangedEventType.CHANGE
      ) {
        handleFileChanged(action as FileChanged, state);
      }
    };

    const fileUpdatedHandler = async (
      state: FSSandboxRootState,
      prevState: FSSandboxRootState
    ) => {
      if (prevState && state.fileCache === prevState.fileCache) {
        return;
      }
      const updatedFiles: FileCache = {};

      for (const uri in state.fileCache) {
        if (!prevState || prevState.fileCache[uri] !== state.fileCache[uri]) {
          updatedFiles[uri] = state.fileCache[uri];
        }
      }

      for (const uri in updatedFiles) {
        await handleUpdatedFile(updatedFiles[uri]);
      }
    };

    return (
      action: Action,
      state: FSSandboxRootState,
      prevState: FSSandboxRootState
    ) => {
      fileChangedHandler(action, state);
      fileUpdatedHandler(state, prevState);
    };
  };
