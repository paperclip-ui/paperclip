var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { noop } from "lodash";
import { startDOMDrag } from "tandem-common";
import { compose, pure, withHandlers, withState, lifecycle } from "recompose";
export var GrabberAxis;
(function (GrabberAxis) {
    GrabberAxis[GrabberAxis["X"] = 1] = "X";
    GrabberAxis[GrabberAxis["Y"] = 2] = "Y";
})(GrabberAxis || (GrabberAxis = {}));
export default compose(pure, withState(`canvas`, `setCanvas`, null), withState(`grabberPoint`, `setGrabberPoint`, null), withHandlers(() => {
    let _canvas;
    return {
        onCanvas: ({ setCanvas, draw = noop }) => (canvas) => {
            setCanvas((_canvas = canvas));
            if (canvas) {
                // need to set immediate to ensure that canvas is actually mounted
                setImmediate(() => {
                    const { width, height } = canvas.parentElement.getBoundingClientRect();
                    draw(canvas, width || 100, height || 100);
                });
            }
        },
        onMouseDown: ({ grabberAxis, setGrabberPoint, onChange, onChangeComplete }) => event => {
            const rect = _canvas.getBoundingClientRect();
            const handleChange = callback => event => {
                const point = {
                    left: grabberAxis & GrabberAxis.X
                        ? Math.max(0, Math.min(rect.width - 1, event.clientX - rect.left))
                        : 0,
                    top: grabberAxis & GrabberAxis.Y
                        ? Math.max(0, Math.min(rect.height - 1, event.clientY - rect.top))
                        : 0
                };
                if (callback) {
                    const imageData = _canvas
                        .getContext("2d")
                        .getImageData(point.left, point.top, 1, 1).data;
                    callback(imageData);
                }
                setGrabberPoint(point);
            };
            startDOMDrag(event, noop, handleChange(onChange), handleChange(onChangeComplete));
        }
    };
}), lifecycle({
    componentDidUpdate({ setGrabberPoint, getGraggerPoint, draw, canvas, value }) {
        if (canvas && this.props.draw !== draw && this.props.draw) {
            setImmediate(() => {
                const { width, height } = canvas.parentElement.getBoundingClientRect();
                this.props.draw(canvas, width, height);
            });
        }
        if (canvas && this.props.value !== value) {
            setImmediate(() => {
                const { width, height } = canvas.parentElement.getBoundingClientRect();
                setGrabberPoint(getGraggerPoint(this.props.value, width, height));
            });
        }
    }
}), (Base) => (_a) => {
    var { onMouseDown, onCanvas, grabberAxis, draw, onChange, onChangeComplete, canvas, grabberPoint } = _a, rest = __rest(_a, ["onMouseDown", "onCanvas", "grabberAxis", "draw", "onChange", "onChangeComplete", "canvas", "grabberPoint"]);
    return (React.createElement(Base, Object.assign({}, rest, { grabberProps: {
            style: grabberPoint
        }, onMouseDown: onMouseDown, canvasProps: {
            ref: onCanvas
        } })));
});
//# sourceMappingURL=canvas-controller.js.map