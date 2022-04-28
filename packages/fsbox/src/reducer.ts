import { Action } from "redux";
import {
  FSSandboxRootState,
  updateFileCacheItem,
  FileCacheItemStatus
} from "./state";
import {
  FS_SANDBOX_ITEM_LOADING,
  FS_SANDBOX_ITEM_LOADED,
  FSSandboxItemLoading,
  FSSandboxItemLoaded,
  FS_SANDBOX_ITEM_SAVING,
  FS_SANDBOX_ITEM_SAVED,
  FsSandboxItemSaved,
  FsSandboxItemSaving
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
        { status: FileCacheItemStatus.LOADED, content, mimeType },
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
    case FS_SANDBOX_ITEM_SAVED: {
      const { uri } = action as FsSandboxItemSaved;
      return updateFileCacheItem(
        { status: FileCacheItemStatus.LOADED, dirty: false },
        uri,
        state
      );
    }
  }

  return state;
};
