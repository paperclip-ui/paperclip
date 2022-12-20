import {
  ApplyMutationsResult,
  FileResponse,
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
  | GraphLoaded
  | ServerEvent
  | ResourceFilePathsLoaded
  | DesignFileCreated;
