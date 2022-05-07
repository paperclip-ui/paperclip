"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFixedBoundsToNewAbsoluteRelativeToParent = exports.convertFixedBoundsToRelative = exports.getFixedSyntheticVisibleNodeStaticPosition = exports.getRelativeParent = exports.isAbsolutelyPositionedNode = exports.isRelativeNode = void 0;
var tandem_common_1 = require("tandem-common");
var Axis;
(function (Axis) {
    Axis[Axis["X"] = 0] = "X";
    Axis[Axis["Y"] = 1] = "Y";
})(Axis || (Axis = {}));
var getStyleProp = function (node, prop, defaultValue) {
    var style = node.style;
    return (style && style[prop]) || defaultValue;
};
var isRelativeNode = function (node) {
    return /relative|absolute|fixed/i.test(getStyleProp(node, "position", "static"));
};
exports.isRelativeNode = isRelativeNode;
var isAbsolutelyPositionedNode = function (node) {
    return /absolute|fixed/i.test(getStyleProp(node, "position", "static"));
};
exports.isAbsolutelyPositionedNode = isAbsolutelyPositionedNode;
exports.getRelativeParent = (0, tandem_common_1.memoize)(function (node, document, frame) {
    return ((0, tandem_common_1.findTreeNodeParent)(node.id, document, exports.isRelativeNode) ||
        (0, tandem_common_1.getNestedTreeNodeById)(frame.syntheticContentNodeId, document));
});
var measurementToPx = function (measurment, axis, node, frame) {
    if (!measurment || measurment === "auto") {
        return 0;
    }
    var _a = measurment.match(/([-\d\.]+)(.+)/), value = _a[1], unit = _a[2];
    if (unit === "px") {
        return Number(value);
    }
    throw new Error("Cannot convert ".concat(unit, " to absolute"));
};
exports.getFixedSyntheticVisibleNodeStaticPosition = (0, tandem_common_1.memoize)(function (node, document, frame) {
    var position = getStyleProp(node, "position");
    if (position === "fixed" || frame.syntheticContentNodeId === node.id) {
        return {
            left: 0,
            top: 0
        };
    }
    if (position === "absolute") {
        var relativeParent = (0, exports.getRelativeParent)(node, document, frame);
        return frame.computed[relativeParent.id].bounds;
    }
    return {
        left: frame.computed[node.id].bounds.left -
            measurementToPx(frame.computed[node.id].style.left, Axis.X, node, frame),
        top: frame.computed[node.id].bounds.top -
            measurementToPx(frame.computed[node.id].style.top, Axis.Y, node, frame)
    };
});
var convertFixedBoundsToRelative = function (bounds, node, document, frame) {
    var staticPosition = (0, exports.getFixedSyntheticVisibleNodeStaticPosition)(node, document, frame);
    return (0, tandem_common_1.shiftBounds)(bounds, {
        left: -staticPosition.left,
        top: -staticPosition.top
    });
};
exports.convertFixedBoundsToRelative = convertFixedBoundsToRelative;
/**
 * Used to maintian the same position of a node when it's moved to another parent.  This function
 * assumes that the node is translated to be absolutely positioned since there moving a relatively positioned
 * element to a parent will have cascading affects to other children. We don't want that. Also, moving a relatively
 * positioned element to another parent would need to consider the layout engine (we don't have access to that directly), so
 * the static position of the element cannot easily be computed (unless we want to mock the DOM 😅).
 */
var convertFixedBoundsToNewAbsoluteRelativeToParent = function (bounds, newParent, document, frame) {
    var relativeParent = (0, exports.isRelativeNode)(newParent)
        ? newParent
        : (0, exports.getRelativeParent)(newParent, document, frame);
    var relativeParentBounds = frame.computed[relativeParent.id].bounds;
    // based on abs parent of new child.
    return (0, tandem_common_1.moveBounds)(bounds, {
        left: bounds.left - relativeParentBounds.left,
        top: bounds.top - relativeParentBounds.top
    });
};
exports.convertFixedBoundsToNewAbsoluteRelativeToParent = convertFixedBoundsToNewAbsoluteRelativeToParent;
//# sourceMappingURL=synthetic-layout.js.map