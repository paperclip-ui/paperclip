import React, { useRef, useCallback } from "react";

import * as styles from "./index.pc";
import { Frames } from "./Frames";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  flattenFrameBoxes,
  getEditorState,
  getSelectedNodePath,
  InsertMode,
} from "@paperclip-ui/designer/src/state";
import { designerEvents } from "@paperclip-ui/designer/src/events";
import { mergeBoxes } from "@paperclip-ui/designer/src/state/geom";
import { Selectable } from "./Selectable";
import { InsertElement } from "./InsertElement";
import { ContextMenu } from "../../../ContextMenu";
import { getEntityShortcuts } from "@paperclip-ui/designer/src/domains/shortcuts/state";

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
    canvas,
    dispatch,
    contextMenu,
    selectedBox,
    readonly,
    hoveringBox,
    toolsLayerEnabled,
    selectedNodePath,
    optionKeyDown,
  } = useTools();

  if (!currentDocument?.paperclip || !toolsLayerEnabled) {
    return null;
  }

  const cursor =
    insertMode != null
      ? {
          [InsertMode.Element]: "crosshair",
          [InsertMode.Text]: "text",
        }[insertMode]
      : null;

  const style = {
    cursor,
  };

  return (
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
            box={hoveringBox}
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
        <Frames
          frames={frames}
          canvasTransform={canvas.transform}
          readonly={readonly}
        />
        {/* {optionKeyDown && selectedBox && hoveringBox ? (
          <Distance
            canvasScroll={canvas.scrollPosition}
            canvasTransform={canvas.transform}
            from={selectedBox}
            to={hoveringBox}
          />
        ) : null} */}
      </styles.Tools>
    </ContextMenu>
  );
};

const useTools = () => {
  const dispatch = useDispatch();
  const {
    canvas,
    highlightNodePath,
    optionKeyDown,
    resizerMoving,
    readonly,
    insertMode,
    rects: frameBoxes,
    currentDocument,
  } = useSelector(getEditorState);
  const toolsLayerEnabled = !canvas.isExpanded;

  const selectedNodePath = useSelector(getSelectedNodePath);
  const contextMenu = useSelector(getEntityShortcuts);

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
      dispatch(designerEvents.canvasMouseMoved(getMousePoint(event)));
    },
    [dispatch]
  );

  const toolsRef = useRef<HTMLDivElement>();

  const onMouswDown = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch(
        designerEvents.canvasMouseDown({
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          timestamp: Date.now(),
          position: getMousePoint(event),
        })
      );
    },
    [dispatch]
  );

  const onMouseUp = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch(designerEvents.canvasMouseUp());
    },
    [dispatch]
  );

  const onMouseLeave = () => {
    dispatch(designerEvents.canvasMouseLeave(null));
  };

  const boxes = flattenFrameBoxes(frameBoxes);

  const selectedBox = boxes[selectedNodePath];

  const hoveringBox = highlightNodePath && boxes[highlightNodePath];

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
    onMouseUp,
    insertMode,
    showEmpty,
    currentDocument,
    toolsLayerEnabled,
    canvas,
    dispatch,
    selectedBox,
    readonly,
    hoveringBox,
    selectedNodePath,
    optionKeyDown,
  };
};
