import { DesignerState } from "./core";
import { Box } from "./geom";
import { findVirtNode } from "./pc";
import { virtHTML } from "@paperclip-ui/proto-ext/lib/virt/html-utils";

export const getInsertMode = (state: DesignerState) => state.insertMode;

export const getExpandedVirtIds = (state: DesignerState) =>
  state.expandedLayerVirtIds;

export const getInsertBox = ({
  canvasMouseDownStartPoint: start,
  canvas: { mousePosition },
}: DesignerState): Box => {
  if (!start) {
    return null;
  }

  return {
    width: Math.abs(start.x - mousePosition.x),
    height: Math.abs(start.y - mousePosition.y),
    x: Math.min(start.x, mousePosition.x),
    y: Math.min(start.y, mousePosition.y),
  };
};
export const getSelectedId = (designer: DesignerState) => {
  return designer.selectedTargetId;
};
export const getHighlightedNodeId = (designer: DesignerState) =>
  designer.highlightedNodeId;
export const getResizerMoving = (designer: DesignerState) =>
  designer.resizerMoving;

export const getSelectedNodePath = (designer: DesignerState) => {
  const nodeId = getSelectedId(designer);
  if (!nodeId || !designer.currentDocument) {
    return null;
  }
  const node = findVirtNode(getSelectedId(designer), designer);
  return virtHTML.getNodePath(node, designer.currentDocument.paperclip.html);
};
