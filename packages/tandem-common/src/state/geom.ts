// import { getV } from "../struct";
import { memoize } from "../utils/memoization";

export type Bounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Bounded = {
  bounds: Bounds;
};

export type Element = {
  width: number;
  height: number;
};

export type Point = {
  left: number;
  top: number;
};

export type Translate = {
  left: number;
  top: number;
  zoom: number;
};

export const createBounds = (
  left: number,
  right: number,
  top: number,
  bottom: number
): Bounds => ({
  left,
  right,
  top,
  bottom,
});

export const moveBounds = (bounds: Bounds, { left, top }: Point): Bounds => ({
  ...bounds,
  left: left,
  top: top,
  right: left + bounds.right - bounds.left,
  bottom: top + bounds.bottom - bounds.top,
});

export const mapBounds = (
  bounds: Bounds,
  map: (value: number, key?: string) => number
): Bounds => ({
  ...bounds,
  left: map(bounds.left, "left"),
  right: map(bounds.right, "right"),
  top: map(bounds.top, "top"),
  bottom: map(bounds.bottom, "bottom"),
});

export const roundBounds = (bounds: Bounds) =>
  mapBounds(bounds, (v) => Math.round(v));

export const createZeroBounds = () => createBounds(0, 0, 0, 0);

export const shiftPoint = (point: Point, delta: Point) => ({
  left: point.left + delta.left,
  top: point.top + delta.top,
});

export const shiftBounds = (bounds: Bounds, { left, top }: Point): Bounds => ({
  ...bounds,
  left: bounds.left + left,
  top: bounds.top + top,
  right: bounds.right + left,
  bottom: bounds.bottom + top,
});

export const resizeBounds = (bounds: Bounds, { width, height }): Bounds => ({
  ...bounds,
  left: bounds.left,
  top: bounds.top,
  right: bounds.left + width,
  bottom: bounds.top + height,
});

export const flipPoint = (point: Point): Point => ({
  left: -point.left,
  top: -point.top,
});

export const pointToBounds = (point: Point): Bounds => ({
  left: point.left,
  top: point.top,
  right: point.left,
  bottom: point.top,
});

export const keepBoundsAspectRatio = (
  newBounds: Bounds,
  oldBounds: Bounds,
  anchor: Point,
  centerPoint = anchor
): Bounds => {
  const newBoundsSize = getBoundsSize(newBounds);
  const oldBoundsSize = getBoundsSize(oldBounds);

  let left = newBounds.left;
  let top = newBounds.top;
  let width = newBoundsSize.width;
  let height = newBoundsSize.height;

  if (anchor.top === 0 || anchor.top === 1) {
    const perc = height / oldBoundsSize.height;
    width = oldBoundsSize.width * perc;
    left =
      oldBounds.left + (oldBoundsSize.width - width) * (1 - centerPoint.left);
  } else if (anchor.top === 0.5) {
    const perc = width / oldBoundsSize.width;
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
export const keepBoundsCenter = (
  newBounds: Bounds,
  oldBounds: Bounds,
  anchor: Point
): Bounds => {
  const newBoundsSize = getBoundsSize(newBounds);
  const oldBoundsSize = getBoundsSize(oldBounds);

  let left = oldBounds.left;
  let top = oldBounds.top;
  let width = oldBoundsSize.width;
  let height = oldBoundsSize.height;
  const delta = {
    left: newBounds.left - oldBounds.left,
    top: newBounds.top - oldBounds.top,
  };

  if (anchor.top === 0) {
    top += delta.top;
    height += delta.top;
    height = oldBounds.top - newBounds.top;
  }

  if (anchor.top === 1) {
    const hdiff = oldBoundsSize.height - newBoundsSize.height;
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
    const wdiff = oldBoundsSize.width - newBoundsSize.width;
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

export const zoomBounds = (bounds: Bounds, zoom: number): Bounds => ({
  ...bounds,
  left: bounds.left * zoom,
  top: bounds.top * zoom,
  right: bounds.right * zoom,
  bottom: bounds.bottom * zoom,
});

export const zoomPoint = (point: Point, zoom: number): Point => ({
  ...point,
  left: point.left * zoom,
  top: point.top * zoom,
});

export const boundsFromRect = ({ width, height }: Element): Bounds => ({
  left: 0,
  top: 0,
  right: width,
  bottom: height,
});

export const getBoundsWidth = (bounds: Bounds) => bounds.right - bounds.left;
export const getBoundsHeight = (bounds: Bounds) => bounds.bottom - bounds.top;
export const getBoundsSize = memoize(
  (bounds: Bounds): Size => ({
    width: getBoundsWidth(bounds),
    height: getBoundsHeight(bounds),
  })
);
export const getBoundsPoint = memoize(
  (bounds: Bounds): Point => ({
    left: bounds.left,
    top: bounds.top,
  })
);

export const scaleInnerBounds = (
  inner: Bounds,
  oldBounds: Bounds,
  newBounds: Bounds
): Bounds => {
  const oldBoundsSize = getBoundsSize(oldBounds);
  const newBoundsSize = getBoundsSize(newBounds);
  const innerBoundsSize = getBoundsSize(inner);

  const percLeft = (inner.left - oldBounds.left) / oldBoundsSize.width;
  const percTop = (inner.top - oldBounds.top) / oldBoundsSize.height;
  const percWidth = innerBoundsSize.width / oldBoundsSize.width;
  const percHeight = innerBoundsSize.height / oldBoundsSize.height;

  const left = newBounds.left + newBoundsSize.width * percLeft;
  const top = newBounds.top + newBoundsSize.height * percTop;
  const right = left + newBoundsSize.width * percWidth;
  const bottom = top + newBoundsSize.height * percHeight;

  return {
    left,
    top,
    right,
    bottom,
  };
};

export const isBounds = (bounds: any) =>
  bounds &&
  bounds.left != null &&
  bounds.top != null &&
  bounds.right != null &&
  bounds.bottom != null;
export const filterBounded = (values: any[]): Bounded[] =>
  values.filter((value) => isBounds(value.bounds));

export const mergeBounds = (...allBounds: Bounds[]) => {
  let left = Infinity;
  let bottom = -Infinity;
  let top = Infinity;
  let right = -Infinity;

  for (const bounds of allBounds) {
    left = Math.min(left, bounds.left);
    right = Math.max(right, bounds.right);
    top = Math.min(top, bounds.top);
    bottom = Math.max(bottom, bounds.bottom);
  }

  return createBounds(left, right, top, bottom);
};

export const centerTransformZoom = (
  translate: Translate,
  bounds: Bounds,
  nz: number,
  point?: Point
): Translate => {
  const oz = translate.zoom;

  const zd = nz / oz;

  const v1w = bounds.right - bounds.left;
  const v1h = bounds.bottom - bounds.top;

  // center is based on the mouse position
  const v1px = point ? point.left / v1w : 0.5;
  const v1py = point ? point.top / v1h : 0.5;

  // calculate v1 center x & y
  const v1cx = v1w * v1px;
  const v1cy = v1h * v1py;

  // old screen width & height
  const v2ow = v1w * oz;
  const v2oh = v1h * oz;

  // old offset pane left
  const v2ox = translate.left;
  const v2oy = translate.top;

  // new width of view 2
  const v2nw = v1w * nz;
  const v2nh = v1h * nz;

  // get the offset px & py of view 2
  const v2px = (v1cx - v2ox) / v2ow;
  const v2py = (v1cy - v2oy) / v2oh;

  const left = v1w * v1px - v2nw * v2px;
  const top = v1h * v1py - v2nh * v2py;

  return {
    left: left,
    top: top,
    zoom: nz,
  };
};

export const boundsIntersect = (a: Bounds, b: Bounds) =>
  !(
    a.left > b.right ||
    a.right < b.left ||
    a.top > b.bottom ||
    a.bottom < a.top
  );
export const pointIntersectsBounds = (point: Point, bounds: Bounds) =>
  !(
    point.left < bounds.left ||
    point.left > bounds.right ||
    point.top < bounds.top ||
    point.top > bounds.bottom
  );
export const getSmallestBounds = (...bounds: Bounds[]) =>
  bounds.reduce(
    (a, b) => {
      const asize = getBoundsSize(a);
      const bsize = getBoundsSize(b);
      return asize.width * asize.height < bsize.width * bsize.height ? a : b;
    },
    { left: Infinity, right: Infinity, top: Infinity, bottom: Infinity }
  );
