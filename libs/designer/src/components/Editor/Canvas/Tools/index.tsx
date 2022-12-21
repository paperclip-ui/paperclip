import React, { useRef, useCallback } from "react";

import * as styles from "./index.pc";
import { Frames } from "./Frames";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  flattenFrameBoxes,
  getEditorState,
  getHighlightedNodeBox,
  getSelectedNodePath,
  InsertMode,
} from "@paperclip-ui/designer/src/state";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { Selectable } from "./Selectable";
import { InsertElement } from "./InsertElement";
import { ContextMenu } from "../../../ContextMenu";
import { getEntityShortcuts } from "@paperclip-ui/designer/src/domains/shortcuts/state";
import { DropTarget } from "./DropTarget";
import { TextEditor } from "./TextEditor";
import { getSelectedExpression } from "@paperclip-ui/designer/src/state/pc";

export const Tools = () => {
  const {
    frames,
    onMouswDown,
    onMouseMove,
    onMouseLeave,
    toolsRef,
    onMouseUp,
    showEmpty,
    insertMode,
    resizerMoving,
    currentDocument,
    selectedExpr,
    showTextEditor,
    canvas,
    dispatch,
    contextMenu,
    selectedBox,
    readonly,
    highlightedBox,
    toolsLayerEnabled,
  } = useTools();

  if (!currentDocument?.paperclip || !toolsLayerEnabled) {
    return null;
  }

  const cursor =
    insertMode != null
      ? {
          [InsertMode.Element]: "crosshair",
          [InsertMode.Resource]: "copy",
          [InsertMode.Text]: "text",
        }[insertMode]
      : null;

  const style = {
    cursor,
  };

  return (
    <DropTarget>
      <ContextMenu menu={contextMenu}>
        <styles.Tools
          ref={toolsRef}
          onMouseDown={onMouswDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={style}
        >
          {insertMode == InsertMode.Element && <InsertElement />}

          {!resizerMoving && (
            <Selectable
              canvasScroll={canvas.scrollPosition}
              canvasTransform={canvas.transform}
              box={highlightedBox}
              cursor={cursor}
            />
          )}

          {selectedBox && selectedBox.width && selectedBox.height ? (
            <Selectable
              canvasScroll={canvas.scrollPosition}
              canvasTransform={canvas.transform}
              box={selectedBox}
              showKnobs
              cursor={cursor}
            />
          ) : null}
          {selectedBox && showTextEditor && (
            <TextEditor expr={selectedExpr} box={selectedBox} canvas={canvas} />
          )}
          <Frames
            frames={frames}
            canvasTransform={canvas.transform}
            readonly={readonly}
          />
        </styles.Tools>
      </ContextMenu>
    </DropTarget>
  );
};

const useTools = () => {
  const dispatch = useDispatch<DesignerEvent>();
  const {
    canvas,
    highlightedNodeId,
    optionKeyDown,
    resizerMoving,
    readonly,
    showTextEditor,
    insertMode,
    rects: frameBoxes,
    currentDocument,
  } = useSelector(getEditorState);

  const highlightedBox = useSelector(getHighlightedNodeBox);

  const toolsLayerEnabled = !canvas.isExpanded;

  const selectedNodePath = useSelector(getSelectedNodePath);
  const contextMenu = useSelector(getEntityShortcuts);
  const selectedExpr = useSelector(getSelectedExpression);

  const getMousePoint = (event) => {
    const rect: ClientRect = (
      event.currentTarget as any
    ).getBoundingClientRect();
    return {
      x: event.pageX - rect.left,
      y: event.pageY - rect.top,
    };
  };

  const onMouseMove = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch({
        type: "editor/canvasMouseMoved",
        payload: getMousePoint(event),
      });
    },
    [dispatch]
  );

  const toolsRef = useRef<HTMLDivElement>();

  const onMouswDown = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch({
        type: "editor/canvasMouseDown",
        payload: {
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          timestamp: Date.now(),
          position: getMousePoint(event),
        },
      });
    },
    [dispatch]
  );

  const onMouseUp = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch({
        type: "editor/canvasMouseUp",
        payload: {
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          timestamp: Date.now(),
          position: getMousePoint(event),
        },
      });
    },
    [dispatch]
  );

  const onMouseLeave = () => {
    dispatch({ type: "editor/canvasMouseLeave" });
  };

  const boxes = flattenFrameBoxes(frameBoxes);

  const selectedBox = boxes[selectedNodePath];

  const frames = currentDocument?.paperclip?.html?.children || [];
  const showEmpty = frames.length === 0;

  return {
    frames,
    resizerMoving,
    toolsRef,
    onMouswDown,
    onMouseMove,
    onMouseLeave,
    contextMenu,
    showTextEditor,
    onMouseUp,
    selectedExpr,
    insertMode,
    showEmpty,
    currentDocument,
    toolsLayerEnabled,
    canvas,
    dispatch,
    selectedBox,
    readonly,
    highlightedBox,
    selectedNodePath,
    optionKeyDown,
  };
};
