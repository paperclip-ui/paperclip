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

export const designerEngineEvents = eventCreators(
  {
    documentOpened: identity<FileResponse>(),
    changesApplied: identity<ApplyMutationsResult>(),
  },
  "designer-engine"
);

export type DesignerEngineEvent = ExtractEventFromCreators<
  typeof designerEngineEvents
>;
