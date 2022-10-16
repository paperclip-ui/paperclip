import { FileResponse } from "@paperclip-ui/proto/lib/service/designer_pb";
import { DesignerEngineState } from "../engine/designer/state";
import { Box, Transform } from "./geom";

export type Canvas = {
  transform: Transform;
  isExpanded?: boolean;
  activeFrame?: number;
};

export type EditorState = {
  curentDocument?: FileResponse.AsObject;
  rects: Record<number, Record<string, Box>>;
  canvas: Canvas;
} & DesignerEngineState;

export const DEFAULT_STATE: EditorState = {
  canvas: {
    transform: { x: 0, y: 0, z: 1 },
  },
  rects: {},
};

export const selectCurrentDocument = (state: EditorState) =>
  state.curentDocument;
export const selectCanvas = (state: EditorState) => {
  return state.canvas;
};
