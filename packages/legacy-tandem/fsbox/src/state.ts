import { memoize } from "tandem-common";
import * as mime from "mime-types";
import { produce } from "immer";

export type FSSandboxRootState = {
  saving?: boolean;
  fileCache: FileCache;
};

export type FileCache = Record<string, FileCacheItem>;

export enum FileCacheItemStatus {
  CREATED,
  LOADING,
  LOADED,
  SAVING,
}

export type FileCacheItem = {
  uri: string;
  status: FileCacheItemStatus;
  content: Buffer;
  sourceContent: Buffer;
  mimeType: string;
};

export const queueOpenFile = <TState extends FSSandboxRootState>(
  uri: string,
  state: TState
): TState => {
  // should always create new file for queueOpen since reducer
  // code may depend on newly loaded content
  return {
    ...(state as any),
    fileCache: {
      ...state.fileCache,
      [uri]: createFileCacheItem(uri),
    },
  };
};

export const queueOpenFiles = <TState extends FSSandboxRootState>(
  uris: string[],
  state: TState
): TState => uris.reduce((state, uri) => queueOpenFile(uri, state), state);

export const getFSItem = (uri: string, state: FSSandboxRootState) =>
  state.fileCache[uri];

export const isImageUri = (uri: string) =>
  /^image\//.test(mime.lookup(uri) || "");
export const isSvgUri = (uri: string) => /\.svg$/.test(uri);

export const saveDirtyFiles = <TState extends FSSandboxRootState>(
  state: TState
): TState => {
  return produce(state, (newState) => {
    newState.saving = true;
  });
};

export const fsCacheBusy = memoize((fileCache: FileCache) => {
  return Object.values(fileCache).some(
    (item) => item.status !== FileCacheItemStatus.LOADED
  );
});

export const getFileCacheItemsByMimetype = (
  mimeType: string,
  state: FileCache
) => {
  const items: FileCacheItem[] = [];
  for (const uri in state) {
    const item = state[uri];
    if (item.mimeType === mimeType) {
      items.push(item);
    }
  }
  return items;
};

export const hasFileCacheItem = (uri: string, state: FSSandboxRootState) =>
  Boolean(state.fileCache[uri]);

export const updateFileCacheItem = <TState extends FSSandboxRootState>(
  properties: Partial<FileCacheItem>,
  uri: string,
  state: TState
): TState => ({
  ...(state as any),
  fileCache: {
    ...state.fileCache,
    [uri]: {
      ...state.fileCache[uri],
      ...properties,
    },
  },
});

export const isDirty = (item: FileCacheItem) => {
  if (item.status === FileCacheItemStatus.SAVING) {
    return false;
  }

  if (item.content && !item.sourceContent) {
    return true;
  }

  return (
    new TextDecoder().decode(item.content) !==
    new TextDecoder().decode(item.sourceContent)
  );
};

const createFileCacheItem = (uri: string): FileCacheItem => ({
  uri,
  status: FileCacheItemStatus.CREATED,
  content: null,
  sourceContent: null,
  mimeType: null,
});

export const getFileCacheItemDataUrl = memoize(
  ({ mimeType, content }: FileCacheItem) =>
    `data:${mimeType};base64, ${content.toString("base64")}`
);
