import "./index.scss";
import * as React from "react";
import { compose, pure, withState, withHandlers } from "recompose";
import { REGISTERED_COMPONENT, getOpenFile } from "../../../../../../../state";
import { getFramesByDependencyUri } from "paperclip";
import { PreviewLayerComponent } from "./preview-layer";
import { throttle } from "lodash";
import { ToolsLayerComponent } from "./tools-layer";
import { Isolate } from "../../../../../../isolated";
import { canvasWheel, canvasContainerMounted, canvasMouseMoved, canvasMouseClicked, canvasMotionRested, canvasDroppedItem, canvasDraggedOver, canvasMouseDoubleClicked, canvasRightClicked } from "../../../../../../../actions";
import { DropTarget } from "react-dnd";
const BaseCanvasComponent = ({ frames, documents, graph, dispatch, dependency, openFiles, toolType, editMode, setCanvasOuter, editorWindow, selectedComponentId, activeFilePath, setCanvasContainer, onWheel, onDrop, hoveringInspectorNodes, selectedInspectorNodes, onMouseEvent, onDragOver, onMouseDoubleClick, onContextMenu, onMouseClick, sourceNodeInspector, connectDropTarget, onDragExit }) => {
    const activeFrames = getFramesByDependencyUri(editorWindow.activeFilePath, frames, documents, graph);
    const openFile = getOpenFile(editorWindow.activeFilePath, openFiles);
    const canvas = openFile.canvas;
    const translate = canvas.translate;
    return (React.createElement("div", { className: "m-canvas", ref: setCanvasContainer },
        React.createElement(Isolate, { inheritCSS: true, ignoreInputEvents: true, className: "canvas-component-isolate", onWheel: onWheel, scrolling: false, translateMousePositions: true },
            React.createElement("span", null,
                React.createElement("style", null, `html, body {
                overflow: hidden;
              }`),
                React.createElement("div", { ref: setCanvasOuter, onMouseMove: onMouseEvent, onDragOver: onDragOver, onContextMenu: onContextMenu, onDrop: onDrop, onClick: onMouseClick, onDoubleClick: onMouseDoubleClick, tabIndex: -1, onDragExit: onDragExit, className: "canvas-inner" }, connectDropTarget(React.createElement("div", { style: {
                        willChange: `transform`,
                        WebkitFontSmoothing: `subpixel-antialiased`,
                        backfaceVisibility: `hidden`,
                        transform: `translate(${translate.left}px, ${translate.top}px) scale(${translate.zoom})`,
                        transformOrigin: "top left"
                    } },
                    React.createElement(PreviewLayerComponent, { frames: activeFrames, dependency: dependency, documents: documents }),
                    React.createElement(ToolsLayerComponent, { toolType: toolType, selectedComponentId: selectedComponentId, editMode: editMode, activeEditorUri: activeFilePath, openFiles: openFiles, sourceNodeInspector: sourceNodeInspector, selectedInspectorNodes: selectedInspectorNodes, hoveringInspectorNodes: hoveringInspectorNodes, documents: documents, graph: graph, frames: frames, dispatch: dispatch, zoom: translate.zoom, editorWindow: editorWindow }))))))));
};
const MAX_WHEEL_DELTA = 150;
const enhance = compose(pure, withState("canvasOuter", "setCanvasOuter", null), withState("canvasContainer", "setCanvasContainer", null), withHandlers(() => {
    let previousDeltaX = 0;
    let previousDeltaY = 0;
    const onWheel = (event, dispatch, canvasOuter) => {
        // slight bug in Windows (maybe it's just within a VM), but deltaX & deltaY "hop" on occassion. Here
        // // we're trying to prevent that.
        // if (Math.abs(event.deltaX) - Math.abs(previousDeltaX) > MAX_WHEEL_DELTA || Math.abs(event.deltaY) - Math.abs(previousDeltaY) > MAX_WHEEL_DELTA) {
        //   return;
        // }
        // previousDeltaX = event.deltaX;
        // previousDeltaY = event.deltaY;
        const rect = canvasOuter.getBoundingClientRect();
        dispatch(canvasWheel(rect.width, rect.height, event));
    };
    return {
        onMouseEvent: ({ dispatch, editorWindow }) => (event) => {
            dispatch(canvasMouseMoved(editorWindow, event));
        },
        onMotionRest: ({ dispatch }) => () => {
            dispatch(canvasMotionRested());
        },
        onMouseClick: ({ dispatch }) => (event) => {
            dispatch(canvasMouseClicked(event));
        },
        onMouseDoubleClick: ({ dispatch }) => (event) => {
            dispatch(canvasMouseDoubleClicked(event));
        },
        onContextMenu: ({ dispatch }) => (event) => {
            dispatch(canvasRightClicked(event));
            event.preventDefault();
            event.stopPropagation();
        },
        setCanvasContainer: ({ dispatch, editorWindow }) => (element) => {
            dispatch(canvasContainerMounted(element, editorWindow.activeFilePath));
        },
        onWheel: ({ dispatch, canvasOuter }) => (event) => {
            // event.persist();
            // event.preventDefault();
            // event.stopPropagation();
            onWheel(event, dispatch, canvasOuter);
        }
    };
}), DropTarget([REGISTERED_COMPONENT, "FILE", "INSPECTOR_NODE"], {
    hover: throttle(({ dispatch }, monitor) => {
        if (!monitor.getClientOffset()) {
            return;
        }
        const { x, y } = monitor.getClientOffset();
        const item = monitor.getItem();
        dispatch(canvasDraggedOver(item, { left: x, top: y }));
    }, 100),
    canDrop: () => {
        return true;
    },
    drop: ({ dispatch, editorWindow }, monitor) => {
        const item = monitor.getItem();
        const offset = monitor.getClientOffset();
        const point = {
            left: offset.x,
            top: offset.y
        };
        dispatch(canvasDroppedItem(item, point, editorWindow.activeFilePath));
    }
}, (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop()
    };
}), pure);
export const CanvasComponent = enhance(BaseCanvasComponent);
//# sourceMappingURL=index.js.map