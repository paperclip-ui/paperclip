import "./path.scss";
import * as React from "react";
import { resizerPathMoved, resizerPathStoppedMoving } from "../../../../../../../../../actions";
import { startDOMDrag, roundBounds } from "tandem-common";
// padding prevents the SVG from getting cut off when transform is applied - particularly during zoom.
const PADDING = 10;
export class Path extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPointClick = (point, event) => {
            const { bounds, dispatch, zoom } = this.props;
            event.stopPropagation();
            const sourceEvent = Object.assign({}, event);
            const wrapActionCreator = createAction => (event, info) => {
                const delta = {
                    left: info.delta.x / zoom,
                    top: info.delta.y / zoom
                };
                dispatch(createAction(point, roundBounds(bounds), roundBounds({
                    left: point.left === 0 ? bounds.left + delta.left : bounds.left,
                    top: point.top === 0 ? bounds.top + delta.top : bounds.top,
                    right: point.left === 1 ? bounds.right + delta.left : bounds.right,
                    bottom: point.top === 1 ? bounds.bottom + delta.top : bounds.bottom
                }), event));
            };
            const svac = wrapActionCreator(resizerPathStoppedMoving);
            startDOMDrag(event, () => { }, wrapActionCreator(resizerPathMoved), (event, info) => {
                // beat click so that items aren't selected
                setTimeout(() => {
                    svac(event, info);
                });
            });
        };
    }
    render() {
        const { bounds, points, zoom, pointRadius, strokeWidth, showPoints = true } = this.props;
        const { onPointClick } = this;
        const width = bounds.right - bounds.left;
        const height = bounds.bottom - bounds.top;
        const cr = pointRadius;
        const crz = cr / zoom;
        const cw = cr * 2;
        const cwz = cw / zoom;
        const w = width + PADDING + Math.max(cw, cwz);
        const h = height + PADDING + Math.max(cw, cwz);
        const p = 100;
        const style = {
            width: w,
            height: h,
            left: -PADDING / 2,
            top: -PADDING / 2,
            position: "relative"
        };
        return (React.createElement("svg", { style: style, viewBox: [0, 0, w, h].join(" "), className: "resizer-path" }, showPoints !== false
            ? points.map((path, i) => (React.createElement("rect", { onMouseDown: event => onPointClick(path, event), className: `point-circle-${path.top * 100}-${path.left * 100}`, strokeWidth: 0, stroke: "black", fill: "transparent", width: cwz, height: cwz, x: path.left * width + PADDING / 2, y: path.top * height + PADDING / 2, rx: 0, ry: 0, key: i })))
            : void 0));
    }
}
//# sourceMappingURL=path.js.map