import { remoteChannel } from "@paperclip-ui/common";
import { ContentChange, PCMutation } from "@paperclip-ui/source-writer";
import {
  NodeStyleInspection,
  VirtNodeSource,
  LoadedData,
} from "@paperclip-ui/utils";
import { Directory, WorkspaceState } from "./state";
import { FSItem } from "tandem-common";
import { FSReadResult } from "fsbox/src/base";
import { VirtualNodeSourceInfo } from "@paperclip-ui/core/src/core/delegate";
import { ProjectInfo, QuickSearchResult } from "@tandem-ui/designer/lib/state";

export const inspectNodeStyleChannel = remoteChannel<
  VirtNodeSource[],
  Array<[VirtNodeSource, NodeStyleInspection]>
>("inspectNodeStyleChannel");

export const setProjectIdChannel = remoteChannel<string, void>(
  "setProjectIdChannel"
);

export const revealNodeSourceChannel = remoteChannel<VirtNodeSource, void>(
  "revealNodeSourceChannel"
);

export const revealNodeSourceByIdChannel = remoteChannel<string, void>(
  "revealNodeSourceByIdChannel"
);

export const openProjectChannel = remoteChannel<
  { uri?: string; branch?: string; id?: string },
  { id: string; directoryPath: string; directoryUri: string }
>("openProjectChannel");

export const editPCSourceChannel = remoteChannel<
  PCMutation[],
  Record<string, ContentChange[]>
>("editPCSourceChannel");

export const editCodeChannel = remoteChannel<
  { uri: string; value: string },
  void
>("editCodeChannel");

export const eventsChannel = remoteChannel<any, void>("eventsChannel");
export const commitChangesChannel = remoteChannel<
  { description: string },
  void
>("commitChangesChannel");
export const setBranchChannel = remoteChannel<
  { branchName: string },
  { branchName: string }
>("setBranchChannel");

export const getAllScreensChannel = remoteChannel<
  void,
  Record<string, LoadedData>
>("getAllScreensChannel");

export const helloChannel = remoteChannel<
  { projectId: string },
  WorkspaceState
>("helloChannel");

export const loadDirectoryChannel = remoteChannel<{ path: string }, Directory>(
  "loadDirectoryChannel"
);

export const openFileChannel = remoteChannel<
  { uri: string },
  { uri: string; document: any; data: any }
>("openFileChannel");

export const loadVirtualNodeSourcesChannel = remoteChannel<
  VirtNodeSource[],
  VirtualNodeSourceInfo[]
>("loadVirtualNodeSourcesChannel");

export const getAllPaperclipFilesChannel = remoteChannel<
  { projectId: string },
  string[]
>("getAllPaperclipFilesChannel");

export const readFileChannel = remoteChannel<{ url: string }, FSReadResult>(
  "readFileChannel"
);

export const readDirectoryChannel = remoteChannel<{ url: string }, FSItem[]>(
  "readDirectoryChannel"
);

export const loadProjectInfoChannel = remoteChannel<
  { projectId: string },
  ProjectInfo
>("loadProjectInfoChannel");

export const openUrlChannel = remoteChannel<{ url: string }, void>(
  "openUrlChannel"
);

export const writeFileChannel = remoteChannel<
  { url: string; content: Buffer },
  void
>("writeFileChannel");

export const searchProjectChannel = remoteChannel<
  { filterText: string; projectId: string },
  QuickSearchResult[]
>("searchProjectChannel");

export const createDirectoryChannel = remoteChannel<{ url: string }, void>(
  "createDirectoryChannel"
);

export const deleteFileChannel = remoteChannel<{ url: string }, void>(
  "deleteFileChannel"
);
