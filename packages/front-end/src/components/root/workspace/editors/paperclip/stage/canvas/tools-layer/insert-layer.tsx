import "./insert-layer.scss";
import * as React from "react";
import { Canvas, ToolType, EditorWindow } from "../../../../../../../../state";
import { insertToolFinished } from "../../../../../../../../actions";
import { Dispatch } from "redux";
import { Bounds, getBoundsSize } from "tandem-common";
import { InspectorNode } from "paperclip";

type InsertLayerOuterProps = {
  toolType: ToolType;
  canvas: Canvas;
  selectedComponentId: string;
  zoom;
  editorWindow: EditorWindow;
  dispatch: Dispatch<any>;
  insertInspectorNode: InspectorNode;
  insertInspectorNodeBounds: Bounds;
  activeEditorUri: string;
};

const CURSOR_MAP = {
  [ToolType.COMPONENT]: "crosshair",
  [ToolType.ELEMENT]: "crosshair",
  [ToolType.TEXT]: "text"
};

const TEXT_PADDING = 5;

type State = {
  previewBounds: Bounds;
};

export class InsertLayer extends React.PureComponent<
  InsertLayerOuterProps,
  State
> {
  state = {
    previewBounds: null
  };

  setPreviewBounds = (bounds: Bounds) => {
    this.setState({ ...this.state, previewBounds: bounds });
  };

  onMouseDown = (startEvent: React.MouseEvent<any>) => {
    const { editorWindow, dispatch } = this.props;
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    dispatch(
      insertToolFinished(
        {
          left: startX,
          top: startY
        },
        editorWindow.activeFilePath
      )
    );
  };

  render() {
    const {
      insertInspectorNodeBounds,
      canvas,
      zoom,
      toolType,
      editorWindow,
      activeEditorUri,
      selectedComponentId
    } = this.props;

    if (editorWindow.activeFilePath !== activeEditorUri) {
      return null;
    }

    const { onMouseDown } = this;

    const { previewBounds } = this.state;

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
      transform: `translate(${-translate.left /
        translate.zoom}px, ${-translate.top / translate.zoom}px) scale(${1 /
        translate.zoom}) translateZ(0)`,
      transformOrigin: `top left`
    };

    let preview;

    if (previewBounds) {
      const { width, height } = getBoundsSize(previewBounds);
      preview = (
        <div>
          <div
            className="preview"
            style={{
              left: previewBounds.left,
              top: previewBounds.top,
              width,
              height
            }}
          />
          <div
            className="preview-text"
            style={{
              left: previewBounds.left + width + TEXT_PADDING,
              top: previewBounds.top + height + TEXT_PADDING
            }}
          >
            {width} x {height}
          </div>
        </div>
      );
    }

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
        boxShadow: `inset 0 0 0 ${borderWidth}px #00B5FF`
      };

      insertOutline = <div style={style as any} />;
    }

    return (
      <div>
        <div
          className="m-insert-layer"
          style={outerStyle}
          onMouseDown={onMouseDown}
        >
          {preview}
        </div>
        {insertOutline}
      </div>
    );
  }
}
