import "./resizer.scss";
import React from "react";
import { debounce } from "lodash";
import { getSelectionBounds, isSelectionMovable, isSelectionResizable } from "../../../../../../../../../state";
import { resizerMoved, resizerStoppedMoving, resizerMouseDown, resizerStartDrag } from "../../../../../../../../../actions";
import { startDOMDrag } from "tandem-common";
import { Path } from "./path";
const POINT_STROKE_WIDTH = 1;
const POINT_RADIUS = 4;
export class Resizer extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onMouseDown = (event) => {
            // 2 if right click. Don't want that or else this will happen:
            // https://github.com/tandemcode/tandem/issues/503
            if (event.button !== 0) {
                return;
            }
            const { dispatch, canvas, frames, documents, selectedInspectorNodes, graph } = this.props;
            dispatch(resizerMouseDown(event));
            const translate = canvas.translate;
            const bounds = getSelectionBounds(selectedInspectorNodes, documents, frames, graph);
            const onStartDrag = event => {
                dispatch(resizerStartDrag(event));
            };
            const calcMousePoint = (delta) => ({
                left: bounds.left + delta.x / translate.zoom,
                top: bounds.top + delta.y / translate.zoom
            });
            const onDrag = (event2, { delta }) => {
                dispatch(resizerMoved(calcMousePoint(delta)));
            };
            // debounce stopped moving so that it beats the stage click event
            // which checks for moving or resizing state.
            const onStopDrag = debounce((event, { delta }) => {
                dispatch(resizerStoppedMoving(calcMousePoint(delta)));
            }, 0);
            startDOMDrag(event, onStartDrag, onDrag, onStopDrag);
        };
    }
    render() {
        const { onMouseDown } = this;
        const { dispatch, zoom, selectedInspectorNodes, rootInspectorNode, graph, documents, frames } = this.props;
        const bounds = getSelectionBounds(selectedInspectorNodes, documents, frames, graph);
        // offset stroke
        const resizerStyle = {
            position: "absolute",
            left: bounds.left,
            top: bounds.top,
            width: bounds.right - bounds.left,
            height: bounds.bottom - bounds.top,
            transform: `translate(-${POINT_RADIUS / zoom}px, -${POINT_RADIUS /
                zoom}px)`,
            transformOrigin: "top left"
        };
        const points = [];
        if (isSelectionMovable(selectedInspectorNodes, rootInspectorNode, graph)) {
            points.push({ left: 0, top: 0 }, { left: 1, top: 0 }, { left: 0.5, top: 0 }, { left: 0, top: 0.5 }, { left: 0, top: 1 });
        }
        if (isSelectionResizable(selectedInspectorNodes, rootInspectorNode, graph)) {
            points.push({ left: 1, top: 0.5 }, { left: 1, top: 1 }, { left: 0.5, top: 1 });
        }
        return (React.createElement("div", { className: "m-resizer-component", tabIndex: -1 },
            React.createElement("div", { className: "m-resizer-component--selection", style: resizerStyle, onMouseDown: onMouseDown },
                React.createElement(Path, { zoom: zoom, points: points, bounds: bounds, strokeWidth: POINT_STROKE_WIDTH, dispatch: dispatch, pointRadius: POINT_RADIUS }))));
    }
}
export * from "./path";
//# sourceMappingURL=resizer.js.map