import { FileResponse } from "@paperclip-ui/proto/lib/service/designer";
import {
  eventCreators,
  identity,
  ExtractEventFromCreators,
} from "@paperclip-ui/common";

export const designerEngineEvents = eventCreators(
  {
    documentOpened: identity<FileResponse>(),
  },
  "designer-engine"
);

export type DesignerEngineEvent = ExtractEventFromCreators<
  typeof designerEngineEvents
>;
