import produce from "immer";
import {
  ResizerPathMoved,
  ResizerPathStoppedMoving,
} from "../domains/ui/events";
import { DesignerState } from "./core";
import { findVirtNode } from "./pc";
import {
  Element as VirtElement,
  TextNode as VirtText,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { virtHTML } from "@paperclip-ui/proto-ext/lib/virt/html-utils";

export const handleDragEvent = (
  state: DesignerState,
  event: ResizerPathStoppedMoving | ResizerPathMoved
) => {
  return produce(state, (newState) => {
    const node = findVirtNode(newState.selectedTargetId, newState) as any as
      | VirtElement
      | VirtText;

    const path = virtHTML.getNodePath(
      node,
      newState.currentDocument.paperclip.html
    );

    // within a frame
    if (path.includes(".")) {
      const computedStyles = newState.preEditComputedStyles[node.id];

      newState.styleOverrides = {};

      newState.styleOverrides[node.id] = {
        left: `${
          pxToInt(computedStyles.left) +
          event.payload.newBounds.x -
          event.payload.originalBounds.x
        }px`,
        top: `${
          pxToInt(computedStyles.top) +
          event.payload.newBounds.y -
          event.payload.originalBounds.y
        }px`,

        position:
          computedStyles.position === "static"
            ? "relative"
            : computedStyles.position,

        width: event.payload.newBounds.width + "px",
        height: event.payload.newBounds.height + "px",
      };

      // is a frame
    } else {
      if (!node.metadata) {
        node.metadata = {};
      }
      if (!node.metadata.bounds) {
        node.metadata.bounds = { x: 0, y: 0, width: 0, height: 0 };
      }

      node.metadata.bounds = {
        ...event.payload.newBounds,
      };
    }
  });
};
const pxToInt = (value: string) => Number(value.replace("px", ""));
