import {
  ApplyMutationsResult,
  FileResponse,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import {
  eventCreators,
  identity,
  ExtractEventFromCreators,
} from "@paperclip-ui/common";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { DesignerEvent as DesignServerEvent } from "@paperclip-ui/proto/lib/generated/service/designer";

export const designerEngineEvents = eventCreators(
  {
    documentOpened: identity<FileResponse>(),
    changesApplied: identity<ApplyMutationsResult>(),
    graphLoaded: identity<Graph>(),
    serverEvent: identity<DesignServerEvent>(),
  },
  "designer-engine"
);

export type DesignerEngineEvent = ExtractEventFromCreators<
  typeof designerEngineEvents
>;
