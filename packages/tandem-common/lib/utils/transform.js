"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAbsoluteBounds =
  exports.getRelativeElementPosition =
  exports.calculateUntransformedBoundingRect =
  exports.calculateCSSMeasurments =
  exports.translateAbsoluteToRelativePoint =
    void 0;
var state_1 = require("../state");
function translateAbsoluteToRelativePoint(event, relativeElement) {
  var zoom = relativeElement;
  var left = event.clientX || event.left;
  var top = event.clientY || event.top;
  var bounds = relativeElement.getBoundingClientRect();
  var rx = left - bounds.left;
  var ry = top - bounds.top;
  return { left: rx, top: ry };
}
exports.translateAbsoluteToRelativePoint = translateAbsoluteToRelativePoint;
function calculateCSSMeasurments(style) {
  var calculated = {};
  for (var key in style) {
    if (hasMeasurement(key)) {
      calculated[key] = Number(style[key].replace("px", ""));
    }
  }
  return calculated;
}
exports.calculateCSSMeasurments = calculateCSSMeasurments;
/**
 * Robust method for fetching parent nodes outside
 * of an iframe
 */
function getParentNode(node) {
  var parentNode = node.parentNode;
  // if (parentNode) {
  //   if (parentNode.nodeName === "#document") {
  //     const localWindow  = node.ownerDocument.defaultView;
  //     if (localWindow && localWindow !== window) {
  //       const parentWindow = localWindow.parent;
  //       return Array.prototype.find.call(parentWindow.document.querySelectorAll("iframe"), (iframe) => {
  //         return iframe.contentWindow === localWindow;
  //       });
  //     }
  //   // shadow root
  //   } else if (parentNode.nodeName === "#document-fragment" && parentNode["host"]) {
  //     return parentNode["host"];
  //   }
  // }
  return parentNode;
}
function parseCSSMatrixValue(value) {
  return value
    .replace(/matrix\((.*?)\)/, "$1")
    .split(/,\s/)
    .map(function (value) {
      return Number(value);
    });
}
function calculateTransform(node, includeIframes) {
  if (includeIframes === void 0) {
    includeIframes = true;
  }
  var cnode = node;
  var matrix = [0, 0, 0, 0, 0, 0];
  while (cnode) {
    if (cnode.nodeName === "IFRAME" && cnode !== node && !includeIframes) {
      break;
    }
    if (cnode.nodeType === 1) {
      // TODO - this needs to be memoized - getComputedStyle is expensive.
      var style = cnode.ownerDocument.defaultView.getComputedStyle(cnode);
      if (style.transform !== "none") {
        var cnodeMatrix = parseCSSMatrixValue(style.transform);
        for (var i = cnodeMatrix.length; i--; ) {
          matrix[i] += cnodeMatrix[i];
        }
      }
    }
    cnode = getParentNode(cnode);
  }
  return [
    matrix[0] || 1,
    matrix[1],
    matrix[2],
    matrix[3] || 1,
    matrix[4],
    matrix[5],
  ];
}
function calculateUntransformedBoundingRect(node) {
  var rect = node.getBoundingClientRect();
  var bounds = (0, state_1.createBounds)(
    rect.left,
    rect.right,
    rect.top,
    rect.bottom
  );
  var matrix = calculateTransform(node, false);
  return (0, state_1.zoomBounds)(
    (0, state_1.shiftBounds)(bounds, { left: -matrix[4], top: -matrix[5] }),
    1 / matrix[0]
  );
}
exports.calculateUntransformedBoundingRect = calculateUntransformedBoundingRect;
function hasMeasurement(key) {
  return /left|top|right|bottom|width|height|padding|margin|border/.test(key);
}
function roundMeasurements(style) {
  var roundedStyle = {};
  for (var key in style) {
    var measurement = (roundedStyle[key] = style[key]);
    if (hasMeasurement(key)) {
      var value = measurement.match(/^(-?[\d\.]+)/)[1];
      var unit = measurement.match(/([a-z]+)$/)[1];
      // ceiling is necessary here for zoomed in elements
      roundedStyle[key] = Math.round(Number(value)) + unit;
    }
  }
  return roundedStyle;
}
var getRelativeElementPosition = function (element) {
  var style = element.ownerDocument.defaultView.getComputedStyle(element);
};
exports.getRelativeElementPosition = getRelativeElementPosition;
function calculateAbsoluteBounds(node) {
  var rect = calculateUntransformedBoundingRect(node);
  return rect;
}
exports.calculateAbsoluteBounds = calculateAbsoluteBounds;
function calculateElementTransforms(node) {
  var computedStyle = calculateCSSMeasurments(
    node.ownerDocument.defaultView.getComputedStyle(node)
  );
  var oldWidth = node.style.width;
  var oldTop = node.style.top;
  var oldLeft = node.style.left;
  var oldBoundsSizing = node.style.boxSizing;
  node.style.left = "0px";
  node.style.top = "0px";
  node.style.width = "100px";
  node.style.boxSizing = "border-bounds";
  var bounds = this.bounds;
  var scale = bounds.width / 100;
  var left = bounds.left;
  var top = bounds.top;
  node.style.left = oldLeft;
  node.style.top = oldTop;
  node.style.width = oldWidth;
  node.style.boxSizing = oldBoundsSizing;
  return { scale: scale, left: left, top: top };
}
//# sourceMappingURL=transform.js.map
