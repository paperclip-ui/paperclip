import { FileCacheItem, FileCacheItemStatus } from "./state";
import { Action } from "redux";

export const FS_SANDBOX_ITEM_LOADING = "FS_SANDBOX_ITEM_LOADING";
export const FS_SANDBOX_ITEM_LOADED = "FS_SANDBOX_ITEM_LOADED";
export const FS_SANDBOX_ITEM_SAVED = "FS_SANDBOX_ITEM_SAVED";
export const FS_SANDBOX_SAVING = "FS_SANDBOX_SAVING";
export const FS_SANDBOX_ITEM_SAVING = "FS_SANDBOX_ITEM_SAVING";
export const FILE_CHANGED = "FILE_CHANGED";

export enum FileChangedEventType {
  UNLINK = "unlink",
  ADD = "add",
  UNLINK_DIR = "unlinkDir",
  ADD_DIR = "addDir",
  CHANGE = "change",
}

export type FileChanged = {
  eventType: FileChangedEventType;
  uri: string;
} & Action;

export type FSSandboxItemLoaded = {
  uri: string;
  content: Buffer;
  mimeType: string;
} & Action;

export type FSSandboxItemLoading = {
  uri: string;
} & Action;

export type FsSandboxItemSaved = {
  uri: string;
} & Action;

export type FsSandboxItemSaving = {
  uri: string;
} & Action;

export const fsSandboxItemLoaded = (
  uri: string,
  content: Buffer,
  mimeType: string
): FSSandboxItemLoaded => ({
  uri,
  content,
  mimeType,
  type: FS_SANDBOX_ITEM_LOADED,
});

export const fsSandboxItemLoading = (uri: string): FSSandboxItemLoading => ({
  uri,
  type: FS_SANDBOX_ITEM_LOADING,
});

export const fsSandboxItemSaving = (uri: string): FsSandboxItemSaving => ({
  uri,
  type: FS_SANDBOX_ITEM_SAVING,
});

export const fsSandboxItemSaved = (uri: string): FsSandboxItemSaved => ({
  uri,
  type: FS_SANDBOX_ITEM_SAVED,
});

export const fsSandboxSaving = () => ({
  type: FS_SANDBOX_SAVING,
});

export const fileChanged = (
  eventType: FileChangedEventType,
  uri: string
): FileChanged => ({
  type: FILE_CHANGED,
  eventType,
  uri,
});
