import "./document-overlay.scss";
const cx = require("classnames");
import * as React from "react";
import Hammer from "react-hammerjs";
import { wrapEventToDispatch } from "../../../../../../../../utils";
import { getFramesByDependencyUri, getInspectorSyntheticNode } from "paperclip";
import { memoize, reuser } from "tandem-common";
import { canvasToolOverlayMousePanStart, canvasToolOverlayMousePanning, canvasToolOverlayMousePanEnd, canvasToolOverlayMouseDoubleClicked } from "../../../../../../../../actions";
import { NodeOverlay as BaseNodeOverlay } from "./node-overlay.pc";
class NodeOverlay extends React.PureComponent {
    render() {
        const { zoom, bounds, dispatch } = this.props;
        if (!bounds) {
            return null;
        }
        const borderWidth = 2 / zoom;
        const width = Math.ceil(bounds.right - bounds.left);
        const height = Math.ceil(bounds.bottom - bounds.top);
        const titleScale = Math.max(1 / zoom, 0.03);
        const textStyle = {
            transformOrigin: `top right`,
            transform: `scale(${titleScale})`
        };
        const style = {
            left: bounds.left,
            top: bounds.top,
            // round to ensure that the bounds match up with the selection bounds
            width,
            height,
            boxShadow: `inset 0 0 0 ${borderWidth}px rgba(88, 185, 255, 1)`
        };
        return (React.createElement(BaseNodeOverlay, { style: style, labelContainerProps: { style: textStyle }, labelProps: {
                text: `${width} x ${height}`
            } }));
    }
}
const getDocumentRelativeBounds = memoize((document) => ({
    left: 0,
    top: 0,
    right: document.bounds.right - document.bounds.left,
    bottom: document.bounds.bottom - document.bounds.top
}));
class ArtboardOverlayTools extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPanStart = event => {
            this.props.dispatch(canvasToolOverlayMousePanStart(this.props.frame.syntheticContentNodeId));
        };
        this.onPan = event => {
            this.props.dispatch(canvasToolOverlayMousePanning(this.props.frame.syntheticContentNodeId, { left: event.center.x, top: event.center.y }, event.deltaY, event.velocityY));
        };
        this.onPanEnd = event => {
            event.preventDefault();
            setImmediate(() => {
                this.props.dispatch(canvasToolOverlayMousePanEnd(this.props.frame.syntheticContentNodeId));
            });
        };
    }
    render() {
        const { dispatch, frame, hoveringSyntheticNodeIds, zoom } = this.props;
        const { onPanStart, onPan, onPanEnd } = this;
        if (!frame.computed) {
            return null;
        }
        if (!frame.bounds) {
            return null;
        }
        const bounds = frame.bounds;
        // TODO - compute info based on content
        const style = {
            position: "absolute",
            left: bounds.left,
            top: bounds.top,
            width: bounds.right - bounds.left,
            height: bounds.bottom - bounds.top
        };
        return (React.createElement("div", { style: style },
            React.createElement(Hammer, { onPanStart: onPanStart, onPan: onPan, onPanEnd: onPanEnd, direction: "DIRECTION_ALL" },
                React.createElement("div", { style: { width: "100%", height: "100%", position: "absolute" }, onDoubleClick: wrapEventToDispatch(dispatch, canvasToolOverlayMouseDoubleClicked.bind(this, frame.syntheticContentNodeId)) }, hoveringSyntheticNodeIds.map((nodeId, i) => (React.createElement(NodeOverlay, { zoom: zoom, key: nodeId, bounds: frame.syntheticContentNodeId === nodeId
                        ? getDocumentRelativeBounds(frame)
                        : frame.computed[nodeId] && frame.computed[nodeId].bounds, dispatch: dispatch })))))));
    }
}
const reuseHoveringSyntheticNodeIds = reuser(10, (a) => a.join(","));
const getHoveringSyntheticVisibleNodes = (hoveringInspectorNodes, selectedInspectorNodes, documents, frame) => {
    const selectionRefIds = selectedInspectorNodes;
    return hoveringInspectorNodes
        .filter(node => {
        const syntheticNode = getInspectorSyntheticNode(node, documents);
        return ((syntheticNode && frame.computed && frame.computed[syntheticNode.id]) ||
            frame.syntheticContentNodeId === node.id);
    })
        .map(node => getInspectorSyntheticNode(node, documents).id);
};
export class NodeOverlaysTool extends React.PureComponent {
    render() {
        const { frames, editorWindow, dispatch, documents, graph, hoveringInspectorNodes, selectedInspectorNodes, zoom } = this.props;
        const activeFrames = getFramesByDependencyUri(editorWindow.activeFilePath, frames, documents, graph);
        return (React.createElement("div", { className: "visual-tools-layer-component" }, activeFrames.map((frame, i) => {
            return (React.createElement(ArtboardOverlayTools, { key: frame.syntheticContentNodeId, frame: frame, hoveringSyntheticNodeIds: getHoveringSyntheticVisibleNodes(hoveringInspectorNodes, selectedInspectorNodes, documents, frame), dispatch: dispatch, zoom: zoom }));
        })));
    }
}
//# sourceMappingURL=document-overlay.js.map