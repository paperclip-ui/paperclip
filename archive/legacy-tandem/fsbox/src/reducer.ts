import { Action } from "redux";
import { produce } from "immer";
import {
  FSSandboxRootState,
  updateFileCacheItem,
  FileCacheItemStatus,
  getFSItem,
} from "./state";
import {
  FS_SANDBOX_ITEM_LOADING,
  FS_SANDBOX_ITEM_LOADED,
  FSSandboxItemLoading,
  FSSandboxItemLoaded,
  FS_SANDBOX_ITEM_SAVING,
  FS_SANDBOX_ITEM_SAVED,
  FsSandboxItemSaved,
  FsSandboxItemSaving,
  FS_SANDBOX_SAVING,
} from "./actions";

export const fsSandboxReducer = <TState extends FSSandboxRootState>(
  state: TState,
  action: Action
): TState => {
  switch (action.type) {
    case FS_SANDBOX_ITEM_LOADING: {
      const { uri } = action as FSSandboxItemLoading;
      return updateFileCacheItem(
        { status: FileCacheItemStatus.LOADING },
        uri,
        state
      );
    }
    case FS_SANDBOX_ITEM_LOADED: {
      const { uri, content, mimeType } = action as FSSandboxItemLoaded;
      return updateFileCacheItem(
        {
          status: FileCacheItemStatus.LOADED,
          content,
          sourceContent: content,
          mimeType,
        },
        uri,
        state
      );
    }
    case FS_SANDBOX_ITEM_SAVING: {
      const { uri } = action as FsSandboxItemSaving;
      return updateFileCacheItem(
        { status: FileCacheItemStatus.SAVING },
        uri,
        state
      );
    }
    case FS_SANDBOX_SAVING: {
      console.log("SAVE");
      return produce(state, (newState) => {
        newState.saving = false;
      });
    }
    case FS_SANDBOX_ITEM_SAVED: {
      const { uri } = action as FsSandboxItemSaved;
      const item = getFSItem(uri, state);
      return updateFileCacheItem(
        { status: FileCacheItemStatus.LOADED, sourceContent: item.content },
        uri,
        state
      );
    }
  }

  return state;
};
