import "./insert-layer.scss";
import React, { useState } from "react";
import { Canvas, ToolType, EditorWindow } from "../../../../../../../../state";
import { insertToolFinished } from "../../../../../../../../actions";
import { Dispatch } from "redux";
import { Bounds, getBoundsSize } from "tandem-common";
import { InspectorNode } from "paperclip";
import { useDispatch } from "react-redux";

type InsertLayerOuterProps = {
  toolType: ToolType;
  canvas: Canvas;
  selectedComponentId: string;
  zoom;
  editorWindow: EditorWindow;
  insertInspectorNode: InspectorNode;
  insertInspectorNodeBounds: Bounds;
  activeEditorUri: string;
};

const TEXT_PADDING = 5;

export const InsertLayer = ({
  editorWindow,
  insertInspectorNodeBounds,
  canvas,
  zoom,
  toolType,
  // onMouseDown,
  // activeEditorUri,
  selectedComponentId,
}: InsertLayerOuterProps) => {
  const dispatch = useDispatch();

  const onMouseDown = (startEvent: React.MouseEvent<any>) => {
    const startX = startEvent.pageX;
    const startY = startEvent.pageY;
    dispatch(
      insertToolFinished(
        {
          left: startX,
          top: startY,
        },
        editorWindow.activeFilePath
      )
    );
  };

  if (toolType == null) {
    return null;
  }
  const translate = canvas.translate;

  let cursor: string = "default";

  if (toolType === ToolType.ELEMENT || toolType === ToolType.TEXT) {
    cursor = "crosshair";
  } else if (toolType === ToolType.COMPONENT && selectedComponentId) {
    cursor = "crosshair";
  }

  const outerStyle = {
    cursor,
    transform: `translate(${-translate.left / translate.zoom}px, ${
      -translate.top / translate.zoom
    }px) scale(${1 / translate.zoom}) translateZ(0)`,
    transformOrigin: `top left`,
  };

  let insertOutline;

  if (insertInspectorNodeBounds) {
    const borderWidth = 2 / zoom;

    const style = {
      left: insertInspectorNodeBounds.left,
      top: insertInspectorNodeBounds.top,
      position: "absolute",

      // round to ensure that the bounds match up with the selection bounds
      width: Math.ceil(
        insertInspectorNodeBounds.right - insertInspectorNodeBounds.left
      ),
      height: Math.ceil(
        insertInspectorNodeBounds.bottom - insertInspectorNodeBounds.top
      ),
      boxShadow: `inset 0 0 0 ${borderWidth}px #00B5FF`,
    };

    insertOutline = <div style={style as any} />;
  }

  return (
    <div>
      <div
        className="m-insert-layer"
        style={outerStyle}
        onMouseDown={onMouseDown}
      ></div>
      {insertOutline}
    </div>
  );
};
