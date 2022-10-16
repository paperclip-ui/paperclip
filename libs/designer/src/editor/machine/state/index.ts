import { FileResponse } from "@paperclip-ui/proto/lib/service/designer_pb";
import {
  Node,
  Document as HTMLDocument,
} from "@paperclip-ui/proto/lib/virt/html_pb";
import { DesignerEngineState } from "../engine/designer/state";
import { Box, centerTransformZoom, mergeBoxes, Size, Transform } from "./geom";
import { memoize } from "@paperclip-ui/common";
export const IS_WINDOWS = false;

export type Canvas = {
  size?: Size;
  transform: Transform;
  isExpanded?: boolean;
  activeFrame?: number;
};

export const DEFAULT_FRAME_BOX = {
  width: 1024,
  height: 768,
  x: 0,
  y: 0,
};
const INITIAL_ZOOM_PADDING = 50;

export type EditorState = {
  centeredInitial: boolean;
  curentDocument?: FileResponse.AsObject;
  rects: Record<number, Record<string, Box>>;
  canvas: Canvas;
} & DesignerEngineState;

export const DEFAULT_STATE: EditorState = {
  centeredInitial: false,
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

export const maybeCenterCanvas = (editor: EditorState, force?: boolean) => {
  if (
    force ||
    (!editor.centeredInitial &&
      editor.canvas.size?.width &&
      editor.canvas.size?.height)
  ) {
    editor = { ...editor, centeredInitial: false };

    let targetBounds: Box;
    const currentFrameIndex = editor.canvas.activeFrame;

    if (currentFrameIndex != null) {
      const frameBoxes = getPreviewFrameBoxes(
        editor.curentDocument?.paperclip?.html
      );
      targetBounds = frameBoxes[currentFrameIndex];
    }

    editor = centerEditorCanvas(editor, targetBounds);

    return editor;
  }
  return editor;
};

// https://github.com/crcn/tandem/blob/10.0.0/packages/dashboard/src/state/index.ts#L1304
export const centerEditorCanvas = (
  editor: EditorState,
  innerBounds?: Box,
  zoomOrZoomToFit: boolean | number = true
) => {
  if (!innerBounds) {
    innerBounds = getAllFrameBounds(editor);
  }

  // no windows loaded
  if (
    innerBounds.x + innerBounds.y + innerBounds.width + innerBounds.height ===
    0
  ) {
    console.warn(` Cannot center when bounds has no size`);
    return editor;
  }

  const {
    canvas: {
      transform,
      size: { width, height },
    },
  } = editor;

  const centered = {
    x: -innerBounds.x + width / 2 - innerBounds.width / 2,
    y: -innerBounds.y + height / 2 - innerBounds.height / 2,
  };

  const scale =
    typeof zoomOrZoomToFit === "boolean"
      ? Math.min(
          (width - INITIAL_ZOOM_PADDING) / innerBounds.width,
          (height - INITIAL_ZOOM_PADDING) / innerBounds.height
        )
      : typeof zoomOrZoomToFit === "number"
      ? zoomOrZoomToFit
      : transform.z;

  editor = {
    ...editor,
    canvas: {
      ...editor.canvas,
      transform: centerTransformZoom(
        {
          ...centered,
          z: 1,
        },
        {
          x: 0,
          y: 0,
          width,
          height,
        },
        Math.min(scale, 1)
      ),
    },
  };

  console.log(editor.canvas);

  return editor;
};

const getAllFrameBounds = (designer: EditorState) => {
  return mergeBoxes(getCurrentPreviewFrameBoxes(designer));
};

export const getCurrentPreviewFrameBoxes = (editor: EditorState) => {
  const preview = editor.curentDocument?.paperclip?.html;

  return preview ? getPreviewFrameBoxes(preview).filter(Boolean) : [];
};

const getPreviewFrameBoxes = (preview: HTMLDocument.AsObject) => {
  const currentPreview = preview;
  const frameBoxes = getPreviewChildren(currentPreview).map(
    (frame: Node.AsObject) => {
      const metadata = getInnerNode(frame).metadata;
      const box = metadata.bounds || DEFAULT_FRAME_BOX;
      if (metadata.visible === false) {
        return null;
      }
      return { ...DEFAULT_FRAME_BOX, ...box };
    }
  );

  return frameBoxes;
};

const getInnerNode = (node: Node.AsObject) => node.element || node.textNode;

export const getPreviewChildren = (frame: HTMLDocument.AsObject) => {
  // return frame.kind === VirtualNodeKind.Fragment ? frame.children : [frame];
  return frame.childrenList;
};

export const flattenFrameBoxes = memoize(
  (frameBoxes: Record<string, Record<string, Box>>) => {
    const all = {};
    for (const id in frameBoxes) {
      Object.assign(all, frameBoxes[id]);
    }
    return all;
  }
);
