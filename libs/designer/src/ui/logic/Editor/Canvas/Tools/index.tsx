import React, { useRef, useCallback } from "react";

import * as styles from "./index.pc";
import { Frames } from "./Frames";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getEditorState,
  getHighlightedNodeBox,
  getSelectedNodeBox,
  InsertMode,
} from "@paperclip-ui/designer/src/state";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { Selectable } from "./Selectable";
import { InsertElement } from "./InsertElement";
import { ContextMenu } from "../../../ContextMenu";
import { getSelectedEntityShortcuts } from "@paperclip-ui/designer/src/domains/shortcuts/state";
import { DropTarget } from "./DropTarget";
import { TextEditor } from "./TextEditor";
import {
  getGraph,
  getSelectedExpressionInfo,
} from "@paperclip-ui/designer/src/state/pc";
import { ast } from "@paperclip-ui/core/lib/src/proto/ast/pc-utils";
import { ExpressionKind } from "../../EditorPanels/RightSidebar/StylePanel/Declarations/DeclarationValue/state";

export const Tools = () => {
  const {
    frames,
    onMouswDown,
    onMouseMove,
    onMouseLeave,
    toolsRef,
    resizeable,
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
      <ContextMenu menu={() => contextMenu}>
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
              showKnobs={resizeable}
              cursor={cursor}
            />
          ) : null}
          {selectedBox &&
            showTextEditor &&
            selectedExpr?.kind === ast.ExprKind.TextNode && (
              <TextEditor
                expr={selectedExpr.expr}
                box={selectedBox}
                canvas={canvas}
              />
            )}
          <Frames
            canvasScroll={canvas.scrollPosition}
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
    optionKeyDown,
    resizerMoving,
    readonly,
    showTextEditor,
    insertMode,
    rects,
    currentDocument,
  } = useSelector(getEditorState);

  const highlightedBox = useSelector(getHighlightedNodeBox);
  const selectedBox = useSelector(getSelectedNodeBox);

  const toolsLayerEnabled = !canvas.isExpanded;

  const contextMenu = useSelector(getSelectedEntityShortcuts);
  const selectedExpr = useSelector(getSelectedExpressionInfo);
  const graph = useSelector(getGraph);

  const resizeable =
    selectedExpr &&
    ast.getParentExprInfo(selectedExpr.expr.id, graph).kind ==
      ast.ExprKind.Document;

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
        type: "ui/canvasMouseMoved",
        payload: getMousePoint(event),
      });
    },
    [dispatch]
  );

  const toolsRef = useRef<HTMLDivElement>();

  const onMouswDown = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch({
        type: "ui/canvasMouseDown",
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
        type: "ui/canvasMouseUp",
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
    dispatch({ type: "ui/canvasMouseLeave" });
  };

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
    resizeable,
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
    optionKeyDown,
  };
};
