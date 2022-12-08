import {
  ApplyMutationsResult,
  FileResponse,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import {
  eventCreators,
  identity,
  ExtractEventFromCreators,
} from "@paperclip-ui/common";
import { MutationResult } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";

export const designerEngineEvents = eventCreators(
  {
    documentOpened: identity<FileResponse>(),
    changesApplied: identity<ApplyMutationsResult>(),
    graphLoaded: identity<Graph>(),
  },
  "designer-engine"
);

export type DesignerEngineEvent = ExtractEventFromCreators<
  typeof designerEngineEvents
>;
