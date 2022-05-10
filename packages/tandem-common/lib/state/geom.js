"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmallestBounds =
  exports.pointIntersectsBounds =
  exports.boundsIntersect =
  exports.centerTransformZoom =
  exports.mergeBounds =
  exports.filterBounded =
  exports.isBounds =
  exports.scaleInnerBounds =
  exports.getBoundsPoint =
  exports.getBoundsSize =
  exports.getBoundsHeight =
  exports.getBoundsWidth =
  exports.boundsFromRect =
  exports.zoomPoint =
  exports.zoomBounds =
  exports.keepBoundsCenter =
  exports.keepBoundsAspectRatio =
  exports.pointToBounds =
  exports.flipPoint =
  exports.resizeBounds =
  exports.shiftBounds =
  exports.shiftPoint =
  exports.createZeroBounds =
  exports.roundBounds =
  exports.mapBounds =
  exports.moveBounds =
  exports.createBounds =
    void 0;
// import { getV } from "../struct";
var memoization_1 = require("../utils/memoization");
var createBounds = function (left, right, top, bottom) {
  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
  };
};
exports.createBounds = createBounds;
var moveBounds = function (bounds, _a) {
  var left = _a.left,
    top = _a.top;
  return __assign(__assign({}, bounds), {
    left: left,
    top: top,
    right: left + bounds.right - bounds.left,
    bottom: top + bounds.bottom - bounds.top,
  });
};
exports.moveBounds = moveBounds;
var mapBounds = function (bounds, map) {
  return __assign(__assign({}, bounds), {
    left: map(bounds.left, "left"),
    right: map(bounds.right, "right"),
    top: map(bounds.top, "top"),
    bottom: map(bounds.bottom, "bottom"),
  });
};
exports.mapBounds = mapBounds;
var roundBounds = function (bounds) {
  return (0, exports.mapBounds)(bounds, function (v) {
    return Math.round(v);
  });
};
exports.roundBounds = roundBounds;
var createZeroBounds = function () {
  return (0, exports.createBounds)(0, 0, 0, 0);
};
exports.createZeroBounds = createZeroBounds;
var shiftPoint = function (point, delta) {
  return {
    left: point.left + delta.left,
    top: point.top + delta.top,
  };
};
exports.shiftPoint = shiftPoint;
var shiftBounds = function (bounds, _a) {
  var left = _a.left,
    top = _a.top;
  return __assign(__assign({}, bounds), {
    left: bounds.left + left,
    top: bounds.top + top,
    right: bounds.right + left,
    bottom: bounds.bottom + top,
  });
};
exports.shiftBounds = shiftBounds;
var resizeBounds = function (bounds, _a) {
  var width = _a.width,
    height = _a.height;
  return __assign(__assign({}, bounds), {
    left: bounds.left,
    top: bounds.top,
    right: bounds.left + width,
    bottom: bounds.top + height,
  });
};
exports.resizeBounds = resizeBounds;
var flipPoint = function (point) {
  return {
    left: -point.left,
    top: -point.top,
  };
};
exports.flipPoint = flipPoint;
var pointToBounds = function (point) {
  return {
    left: point.left,
    top: point.top,
    right: point.left,
    bottom: point.top,
  };
};
exports.pointToBounds = pointToBounds;
var keepBoundsAspectRatio = function (
  newBounds,
  oldBounds,
  anchor,
  centerPoint
) {
  if (centerPoint === void 0) {
    centerPoint = anchor;
  }
  var newBoundsSize = (0, exports.getBoundsSize)(newBounds);
  var oldBoundsSize = (0, exports.getBoundsSize)(oldBounds);
  var left = newBounds.left;
  var top = newBounds.top;
  var width = newBoundsSize.width;
  var height = newBoundsSize.height;
  if (anchor.top === 0 || anchor.top === 1) {
    var perc = height / oldBoundsSize.height;
    width = oldBoundsSize.width * perc;
    left =
      oldBounds.left + (oldBoundsSize.width - width) * (1 - centerPoint.left);
  } else if (anchor.top === 0.5) {
    var perc = width / oldBoundsSize.width;
    height = oldBoundsSize.height * perc;
    top =
      oldBounds.top + (oldBoundsSize.height - height) * (1 - centerPoint.top);
  }
  return {
    left: left,
    top: top,
    right: left + width,
    bottom: top + height,
  };
};
exports.keepBoundsAspectRatio = keepBoundsAspectRatio;
var keepBoundsCenter = function (newBounds, oldBounds, anchor) {
  var newBoundsSize = (0, exports.getBoundsSize)(newBounds);
  var oldBoundsSize = (0, exports.getBoundsSize)(oldBounds);
  var left = oldBounds.left;
  var top = oldBounds.top;
  var width = oldBoundsSize.width;
  var height = oldBoundsSize.height;
  var delta = {
    left: newBounds.left - oldBounds.left,
    top: newBounds.top - oldBounds.top,
  };
  if (anchor.top === 0) {
    top += delta.top;
    height += delta.top;
    height = oldBounds.top - newBounds.top;
  }
  if (anchor.top === 1) {
    var hdiff = oldBoundsSize.height - newBoundsSize.height;
    top += hdiff;
    height -= hdiff;
  }
  if (anchor.left === 0) {
    left += delta.left;
    top += delta.top;
    width += oldBounds.left - newBounds.left;
  }
  if (anchor.left === 1) {
    width += delta.left;
    var wdiff = oldBoundsSize.width - newBoundsSize.width;
    left += wdiff;
    width -= wdiff;
  }
  return {
    left: left,
    top: top,
    right: left + width,
    bottom: top + height,
  };
};
exports.keepBoundsCenter = keepBoundsCenter;
var zoomBounds = function (bounds, zoom) {
  return __assign(__assign({}, bounds), {
    left: bounds.left * zoom,
    top: bounds.top * zoom,
    right: bounds.right * zoom,
    bottom: bounds.bottom * zoom,
  });
};
exports.zoomBounds = zoomBounds;
var zoomPoint = function (point, zoom) {
  return __assign(__assign({}, point), {
    left: point.left * zoom,
    top: point.top * zoom,
  });
};
exports.zoomPoint = zoomPoint;
var boundsFromRect = function (_a) {
  var width = _a.width,
    height = _a.height;
  return {
    left: 0,
    top: 0,
    right: width,
    bottom: height,
  };
};
exports.boundsFromRect = boundsFromRect;
var getBoundsWidth = function (bounds) {
  return bounds.right - bounds.left;
};
exports.getBoundsWidth = getBoundsWidth;
var getBoundsHeight = function (bounds) {
  return bounds.bottom - bounds.top;
};
exports.getBoundsHeight = getBoundsHeight;
exports.getBoundsSize = (0, memoization_1.memoize)(function (bounds) {
  return {
    width: (0, exports.getBoundsWidth)(bounds),
    height: (0, exports.getBoundsHeight)(bounds),
  };
});
exports.getBoundsPoint = (0, memoization_1.memoize)(function (bounds) {
  return {
    left: bounds.left,
    top: bounds.top,
  };
});
var scaleInnerBounds = function (inner, oldBounds, newBounds) {
  var oldBoundsSize = (0, exports.getBoundsSize)(oldBounds);
  var newBoundsSize = (0, exports.getBoundsSize)(newBounds);
  var innerBoundsSize = (0, exports.getBoundsSize)(inner);
  var percLeft = (inner.left - oldBounds.left) / oldBoundsSize.width;
  var percTop = (inner.top - oldBounds.top) / oldBoundsSize.height;
  var percWidth = innerBoundsSize.width / oldBoundsSize.width;
  var percHeight = innerBoundsSize.height / oldBoundsSize.height;
  var left = newBounds.left + newBoundsSize.width * percLeft;
  var top = newBounds.top + newBoundsSize.height * percTop;
  var right = left + newBoundsSize.width * percWidth;
  var bottom = top + newBoundsSize.height * percHeight;
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom,
  };
};
exports.scaleInnerBounds = scaleInnerBounds;
var isBounds = function (bounds) {
  return (
    bounds &&
    bounds.left != null &&
    bounds.top != null &&
    bounds.right != null &&
    bounds.bottom != null
  );
};
exports.isBounds = isBounds;
var filterBounded = function (values) {
  return values.filter(function (value) {
    return (0, exports.isBounds)(value.bounds);
  });
};
exports.filterBounded = filterBounded;
var mergeBounds = function () {
  var allBounds = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    allBounds[_i] = arguments[_i];
  }
  var left = Infinity;
  var bottom = -Infinity;
  var top = Infinity;
  var right = -Infinity;
  for (var _a = 0, allBounds_1 = allBounds; _a < allBounds_1.length; _a++) {
    var bounds = allBounds_1[_a];
    left = Math.min(left, bounds.left);
    right = Math.max(right, bounds.right);
    top = Math.min(top, bounds.top);
    bottom = Math.max(bottom, bounds.bottom);
  }
  return (0, exports.createBounds)(left, right, top, bottom);
};
exports.mergeBounds = mergeBounds;
var centerTransformZoom = function (translate, bounds, nz, point) {
  var oz = translate.zoom;
  var zd = nz / oz;
  var v1w = bounds.right - bounds.left;
  var v1h = bounds.bottom - bounds.top;
  // center is based on the mouse position
  var v1px = point ? point.left / v1w : 0.5;
  var v1py = point ? point.top / v1h : 0.5;
  // calculate v1 center x & y
  var v1cx = v1w * v1px;
  var v1cy = v1h * v1py;
  // old screen width & height
  var v2ow = v1w * oz;
  var v2oh = v1h * oz;
  // old offset pane left
  var v2ox = translate.left;
  var v2oy = translate.top;
  // new width of view 2
  var v2nw = v1w * nz;
  var v2nh = v1h * nz;
  // get the offset px & py of view 2
  var v2px = (v1cx - v2ox) / v2ow;
  var v2py = (v1cy - v2oy) / v2oh;
  var left = v1w * v1px - v2nw * v2px;
  var top = v1h * v1py - v2nh * v2py;
  return {
    left: left,
    top: top,
    zoom: nz,
  };
};
exports.centerTransformZoom = centerTransformZoom;
var boundsIntersect = function (a, b) {
  return !(
    a.left > b.right ||
    a.right < b.left ||
    a.top > b.bottom ||
    a.bottom < a.top
  );
};
exports.boundsIntersect = boundsIntersect;
var pointIntersectsBounds = function (point, bounds) {
  return !(
    point.left < bounds.left ||
    point.left > bounds.right ||
    point.top < bounds.top ||
    point.top > bounds.bottom
  );
};
exports.pointIntersectsBounds = pointIntersectsBounds;
var getSmallestBounds = function () {
  var bounds = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    bounds[_i] = arguments[_i];
  }
  return bounds.reduce(
    function (a, b) {
      var asize = (0, exports.getBoundsSize)(a);
      var bsize = (0, exports.getBoundsSize)(b);
      return asize.width * asize.height < bsize.width * bsize.height ? a : b;
    },
    { left: Infinity, right: Infinity, top: Infinity, bottom: Infinity }
  );
};
exports.getSmallestBounds = getSmallestBounds;
//# sourceMappingURL=geom.js.map
