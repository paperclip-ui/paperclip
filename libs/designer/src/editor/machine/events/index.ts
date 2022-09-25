import { eventCreators, ExtractEventFromCreators } from "@paperclip-ui/common";
import { DesignerEngineEvent } from "../engine/designer/events";

const editorEvents = eventCreators({}, "editor");

export type EditorEvent =
  | ExtractEventFromCreators<typeof editorEvents>
  | DesignerEngineEvent;
