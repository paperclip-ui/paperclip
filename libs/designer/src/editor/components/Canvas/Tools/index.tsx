import React, { useRef, useCallback, useEffect } from "react";

import * as styles from "./index.pc";
// import { Selectable } from "./Selectable";
import { Frames } from "./Frames";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  flattenFrameBoxes,
  getCanvas,
  getCurrentDocument,
  getEditorState,
  getFrameBoxes,
  getHighlightedNodePath,
  getResizerMoving,
  getSelectedNodePaths,
} from "../../../machine/state";
import { editorEvents } from "../../../machine/events";
import { mergeBoxes } from "../../../machine/state/geom";

export const Tools = () => {
  const {
    frames,
    onMouswDown,
    onMouseMove,
    onMouseLeave,
    toolsRef,
    showEmpty,
    resizerMoving,
    currentDocument,
    canvas,
    dispatch,
    selectedBox,
    readonly,
    hoveringBox,
    toolsLayerEnabled,
    selectedNodePaths,
    optionKeyDown,
  } = useTools();

  if (!currentDocument?.paperclip || !toolsLayerEnabled) {
    return null;
  }

  return (
    <styles.Tools
      ref={toolsRef}
      hover={!hoveringBox}
      onMouseDown={onMouswDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* <Empty show={showEmpty} />

      <Pixels canvas={canvas} /> */}

      {/* {!resizerMoving && (
        <Selectable
          dispatch={dispatch}
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          box={hoveringBox}
        />
      )}

      {selectedBox ? (
        <Selectable
          dispatch={dispatch}
          canvasScroll={canvas.scrollPosition}
          canvasTransform={canvas.transform}
          box={selectedBox}
          showKnobs={
            selectedNodePaths.every((nodePath) => !nodePath.includes(".")) &&
            !readonly
          }
        />
      ) : null} */}
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
  );
};

const useTools = () => {
  const dispatch = useDispatch();
  const {
    canvas,
    selectedNodePaths,
    highlightNodePath,
    optionKeyDown,
    resizerMoving,
    readonly,
    rects: frameBoxes,
    currentDocument,
  } = useSelector(getEditorState);
  const toolsLayerEnabled = canvas.isExpanded;

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
        })
      );
    },
    [dispatch]
  );

  const onMouseLeave = () => {
    dispatch(editorEvents.canvasMouseLeave(null));
  };

  const boxes = flattenFrameBoxes(frameBoxes);

  const selectedBox =
    selectedNodePaths.length &&
    mergeBoxes(selectedNodePaths.map((path) => boxes[path]));

  const hoveringBox = highlightNodePath && boxes[highlightNodePath];

  const frames = currentDocument?.paperclip?.html?.childrenList || [];
  const showEmpty = frames.length === 0;

  return {
    frames,
    resizerMoving,
    toolsRef,
    onMouswDown,
    onMouseMove,
    onMouseLeave,
    showEmpty,
    currentDocument,
    toolsLayerEnabled,
    canvas,
    dispatch,
    selectedBox,
    readonly,
    hoveringBox,
    selectedNodePaths,
    optionKeyDown,
  };
};
