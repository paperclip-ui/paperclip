import {
  ApplyMutationsResult,
  FileResponse,
  ReadDirectoryResponse,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { BaseEvent } from "@paperclip-ui/common";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { DesignServerEvent } from "@paperclip-ui/proto/lib/generated/service/designer";

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

export type DesignerEngineEvent =
  | DocumentOpened
  | ChangesApplied
  | FileSearchResult
  | DirectoryRead
  | APIError
  | GraphLoaded
  | ServerEvent
  | ResourceFilePathsLoaded
  | DesignFileCreated;
