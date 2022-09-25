import { FileResponse } from "@paperclip-ui/proto/lib/service/designer_pb";
import {
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "../../../modules/machine";

export const designerEngineEvents = eventCreators(
  {
    documentOpened: identity<FileResponse>(),
  },
  "designer-engine"
);

export type DesignerEngineEvent = ExtractEventFromCreators<
  typeof designerEngineEvents
>;
