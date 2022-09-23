import { eventCreators, ExtractEventFromCreators } from "../../modules/machine";
import { DesignerEngineEvent } from "../engine/designer/events";

const editorEvents = eventCreators({}, "editor");

export type EditorEvent = ExtractEventFromCreators<typeof editorEvents> &
  DesignerEngineEvent;
