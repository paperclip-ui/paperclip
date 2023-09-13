import {
  ApplyMutationsResult,
  FileResponse,
  ProjectInfo,
  ReadDirectoryResponse,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { BaseEvent } from "@paperclip-ui/common";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { DesignServerEvent } from "@paperclip-ui/proto/lib/generated/service/designer";
import { FSItemKind } from "../../state";

export type DocumentOpened = BaseEvent<
  "designer-engine/documentOpened",
  FileResponse
>;
export type ChangesApplied = BaseEvent<
  "designer-engine/changesApplied",
  ApplyMutationsResult
>;
export type DirectoryRead = BaseEvent<
  "designer-engine/directoryRead",
  {
    isRoot: boolean;
    path: string;
    items: ReadDirectoryResponse["items"];
  }
>;
export type FileSearchResult = BaseEvent<
  "designer-engine/fileSearchResult",
  {
    rootDir: string;
    paths: string[];
  }
>;
export type ProjectInfoResult = BaseEvent<
  "designer-engine/ProjectInfoResult",
  ProjectInfo
>;

export type APIError = BaseEvent<"designer-engine/apiError">;
export type GraphLoaded = BaseEvent<"designer-engine/graphLoaded", Graph>;
export type ServerEvent = BaseEvent<
  "designer-engine/serverEvent",
  DesignServerEvent
>;
export type ResourceFilePathsLoaded = BaseEvent<
  "designer-engine/resourceFilePathsLoaded",
  string[]
>;
export type DesignFileCreated = BaseEvent<
  "designer-engine/designFileCreated",
  { filePath: string }
>;
export type FileCreated = BaseEvent<
  "designer-engine/fileCreated",
  { filePath: string; kind: FSItemKind }
>;

export type DesignerEngineEvent =
  | DocumentOpened
  | ChangesApplied
  | FileSearchResult
  | FileCreated
  | DirectoryRead
  | APIError
  | ProjectInfoResult
  | GraphLoaded
  | ServerEvent
  | ResourceFilePathsLoaded
  | DesignFileCreated;
