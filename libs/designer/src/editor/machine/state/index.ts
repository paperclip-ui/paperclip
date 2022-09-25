import { FileResponse } from "@paperclip-ui/proto/lib/service/designer_pb";
import { DesignerEngineState } from "../engine/designer/state";

export type EditorState = {
  curentDocument?: FileResponse;
} & DesignerEngineState;
