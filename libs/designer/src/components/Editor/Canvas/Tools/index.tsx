import React, { useRef, useCallback, useEffect, useMemo } from "react";

import * as styles from "./index.pc";
import { Frames } from "./Frames";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  flattenFrameBoxes,
  getEditorState,
  getSelectedNodePath,
  InsertMode,
} from "@paperclip-ui/designer/src/machine/state";
import { editorEvents } from "@paperclip-ui/designer/src/machine/events";
import { mergeBoxes } from "@paperclip-ui/designer/src/machine/state/geom";
import { Selectable } from "./Selectable";
import { InsertElement } from "./InsertElement";
import {
  ContextMenu,
  ContextMenuDivider,
  ContextMenuItem,
} from "../../../ContextMenu";

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
    selectedBox,
    readonly,
    hoveringBox,
    toolsLayerEnabled,
    selectedNodePath,
    optionKeyDown,
  } = useTools();

  const contextMenu = useMemo(
    () => [
      <ContextMenuItem keyCombo="alt+meta+k" onSelect={() => {}}>
        Create component
      </ContextMenuItem>,
      <ContextMenuDivider />,
      <ContextMenuItem keyCombo="meta+x" onSelect={() => {}}>
        Cut
      </ContextMenuItem>,
      <ContextMenuItem keyCombo="meta+c" onSelect={() => {}}>
        Copy
      </ContextMenuItem>,
      <ContextMenuItem keyCombo="meta+p" onSelect={() => {}}>
        Paste
      </ContextMenuItem>,
      <ContextMenuItem
        keyCombo="delete"
        onSelect={() => {
          dispatch(editorEvents.deleteHokeyPressed());
        }}
      >
        Delete
      </ContextMenuItem>,
    ],
    [dispatch]
  );

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
      dispatch(editorEvents.canvasMouseMoved(getMousePoint(event)));
    },
    [dispatch]
  );

  const toolsRef = useRef<HTMLDivElement>();

  const onMouswDown = useCallback(
    (event: React.MouseEvent<any>) => {
      dispatch(
        editorEvents.canvasMouseDown({
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
      dispatch(editorEvents.canvasMouseUp());
    },
    [dispatch]
  );

  const onMouseLeave = () => {
    dispatch(editorEvents.canvasMouseLeave(null));
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
