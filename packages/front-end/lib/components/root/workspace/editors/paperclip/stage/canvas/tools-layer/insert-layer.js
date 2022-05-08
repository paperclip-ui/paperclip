import "./insert-layer.scss";
import * as React from "react";
import { ToolType } from "../../../../../../../../state";
import { insertToolFinished } from "../../../../../../../../actions";
import { getBoundsSize } from "tandem-common";
const CURSOR_MAP = {
    [ToolType.COMPONENT]: "crosshair",
    [ToolType.ELEMENT]: "crosshair",
    [ToolType.TEXT]: "text"
};
const TEXT_PADDING = 5;
export class InsertLayer extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            previewBounds: null
        };
        this.setPreviewBounds = (bounds) => {
            this.setState(Object.assign(Object.assign({}, this.state), { previewBounds: bounds }));
        };
        this.onMouseDown = (startEvent) => {
            const { editorWindow, dispatch } = this.props;
            const startX = startEvent.clientX;
            const startY = startEvent.clientY;
            dispatch(insertToolFinished({
                left: startX,
                top: startY
            }, editorWindow.activeFilePath));
        };
    }
    render() {
        const { insertInspectorNodeBounds, canvas, zoom, toolType, editorWindow, activeEditorUri, selectedComponentId } = this.props;
        if (editorWindow.activeFilePath !== activeEditorUri) {
            return null;
        }
        const { onMouseDown } = this;
        const { previewBounds } = this.state;
        if (toolType == null) {
            return null;
        }
        const translate = canvas.translate;
        let cursor = "default";
        if (toolType === ToolType.ELEMENT || toolType === ToolType.TEXT) {
            cursor = "crosshair";
        }
        else if (toolType === ToolType.COMPONENT && selectedComponentId) {
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
            preview = (React.createElement("div", null,
                React.createElement("div", { className: "preview", style: {
                        left: previewBounds.left,
                        top: previewBounds.top,
                        width,
                        height
                    } }),
                React.createElement("div", { className: "preview-text", style: {
                        left: previewBounds.left + width + TEXT_PADDING,
                        top: previewBounds.top + height + TEXT_PADDING
                    } },
                    width,
                    " x ",
                    height)));
        }
        let insertOutline;
        if (insertInspectorNodeBounds) {
            const borderWidth = 2 / zoom;
            const style = {
                left: insertInspectorNodeBounds.left,
                top: insertInspectorNodeBounds.top,
                position: "absolute",
                // round to ensure that the bounds match up with the selection bounds
                width: Math.ceil(insertInspectorNodeBounds.right - insertInspectorNodeBounds.left),
                height: Math.ceil(insertInspectorNodeBounds.bottom - insertInspectorNodeBounds.top),
                boxShadow: `inset 0 0 0 ${borderWidth}px #00B5FF`
            };
            insertOutline = React.createElement("div", { style: style });
        }
        return (React.createElement("div", null,
            React.createElement("div", { className: "m-insert-layer", style: outerStyle, onMouseDown: onMouseDown }, preview),
            insertOutline));
    }
}
//# sourceMappingURL=insert-layer.js.map