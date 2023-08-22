import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import {
  BoxNodeInfo,
  DesignerState,
  FrameBox,
  getCurrentFilePath,
} from "./core";
import { ComputedStyleMap } from "@paperclip-ui/proto-ext/lib/ast/serialize";
import { WritableDraft } from "immer/dist/internal";
import { virtHTML } from "@paperclip-ui/proto-ext/lib/virt/html-utils";
import { Bounds } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";

import * as pc from "@paperclip-ui/proto/lib/generated/ast/pc";
import {
  Node,
  Document as HTMLDocument,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import {
  Element as VirtElement,
  TextNode as VirtText,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import {
  Component,
  Element,
  Reference,
  Variant,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import produce from "immer";
import {
  Box,
  Point,
  boxIntersectsPoint,
  getScaledPoint,
  mergeBoxes,
} from "./geom";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { memoize } from "@paperclip-ui/common";
import { pickBy } from "lodash";
import { hasUncaughtExceptionCaptureCallback } from "process";

export const MIXED_VALUE = "mixed";

export const DEFAULT_FRAME_BOX = {
  width: 1024,
  height: 768,
  x: 0,
  y: 0,
};

export type ComputedDeclaration = {
  name: string;

  // The computed
  computedValue: string;
  value: string;
  explicitValue: string;

  // does the value match what the browser defines by default?
  isDefault: boolean;

  // Is the value explicitly defined in the AST? If so we always want
  // to display this, even if it's default
  isExplicitlyDefined: boolean;
};

export type ComponentInfo = {
  sourcePath: string;
  component: Component;
};

const AVAILABLE_STYLES = {
  "accent-color": "auto",
  "align-content": "normal",
  "align-items": "normal",
  "align-self": "auto",
  "animation-delay": "0s",
  "animation-direction": "normal",
  "animation-duration": "0s",
  "animation-fill-mode": "none",
  "animation-iteration-count": "1",
  "animation-name": "none",
  "animation-play-state": "running",
  "animation-timing-function": "ease",
  appearance: "none",
  "aspect-ratio": "auto",
  "backdrop-filter": "none",
  "backface-visibility": "visible",
  "background-attachment": "scroll",
  "background-blend-mode": "normal",
  "background-clip": "border-box",
  "background-color": "rgba(0, 0, 0, 0)",
  "background-image": "none",
  "background-origin": "padding-box",
  "background-position-x": "0%",
  "background-position-y": "0%",
  "background-repeat": "repeat",
  "background-size": "auto",
  "block-size": "0px",
  "border-block-end-color": "rgb(0, 0, 0)",
  "border-block-end-style": "none",
  "border-block-end-width": "0px",
  "border-block-start-color": "rgb(0, 0, 0)",
  "border-block-start-style": "none",
  "border-block-start-width": "0px",
  "border-bottom-color": "rgb(0, 0, 0)",
  "border-bottom-left-radius": "0px",
  "border-bottom-right-radius": "0px",
  "border-bottom-style": "none",
  "border-bottom-width": "0px",
  "border-collapse": "separate",
  "border-end-end-radius": "0px",
  "border-end-start-radius": "0px",
  "border-image-outset": "0",
  "border-image-repeat": "stretch",
  "border-image-slice": "100%",
  "border-image-source": "none",
  "border-image-width": "1",
  "border-inline-end-color": "rgb(0, 0, 0)",
  "border-inline-end-style": "none",
  "border-inline-end-width": "0px",
  "border-inline-start-color": "rgb(0, 0, 0)",
  "border-inline-start-style": "none",
  "border-inline-start-width": "0px",
  "border-left-color": "rgb(0, 0, 0)",
  "border-left-style": "none",
  "border-left-width": "0px",
  "border-right-color": "rgb(0, 0, 0)",
  "border-right-style": "none",
  "border-right-width": "0px",
  "border-spacing": "0px 0px",
  "border-start-end-radius": "0px",
  "border-start-start-radius": "0px",
  "border-top-color": "rgb(0, 0, 0)",
  "border-top-left-radius": "0px",
  "border-top-right-radius": "0px",
  "border-top-style": "none",
  "border-top-width": "0px",
  bottom: "768px",
  "box-decoration-break": "slice",
  "box-shadow": "none",
  "box-sizing": "border-box",
  "break-after": "auto",
  "break-before": "auto",
  "break-inside": "auto",
  "caption-side": "top",
  "caret-color": "rgb(0, 0, 0)",
  clear: "none",
  clip: "auto",
  "clip-path": "none",
  "clip-rule": "nonzero",
  color: "rgb(0, 0, 0)",
  "color-interpolation": "srgb",
  "color-interpolation-filters": "linearrgb",
  "color-scheme": "normal",
  "column-count": "auto",
  "column-fill": "balance",
  "column-gap": "normal",
  "column-rule-color": "rgb(0, 0, 0)",
  "column-rule-style": "none",
  "column-rule-width": "0px",
  "column-span": "none",
  "column-width": "auto",
  contain: "none",
  "contain-intrinsic-block-size": "none",
  "contain-intrinsic-height": "none",
  "contain-intrinsic-inline-size": "none",
  "contain-intrinsic-width": "none",
  content: "normal",
  "counter-increment": "none",
  "counter-reset": "none",
  "counter-set": "none",
  cursor: "auto",
  cx: "0px",
  cy: "0px",
  d: "none",
  direction: "ltr",
  display: "block",
  "dominant-baseline": "auto",
  "empty-cells": "show",
  fill: "rgb(0, 0, 0)",
  "fill-opacity": "1",
  "fill-rule": "nonzero",
  filter: "none",
  "flex-basis": "auto",
  "flex-direction": "row",
  "flex-grow": "0",
  "flex-shrink": "1",
  "flex-wrap": "nowrap",
  gap: "normal",
  float: "none",
  "flood-color": "rgb(0, 0, 0)",
  "flood-opacity": "1",
  "font-family": "serif",
  "font-feature-settings": "normal",
  "font-kerning": "auto",
  "font-language-override": "normal",
  "font-optical-sizing": "auto",
  "font-palette": "normal",
  "font-size": "16px",
  "font-size-adjust": "none",
  "font-stretch": "100%",
  "font-style": "normal",
  "font-synthesis": "weight style small-caps",
  "font-variant-alternates": "normal",
  "font-variant-caps": "normal",
  "font-variant-east-asian": "normal",
  "font-variant-ligatures": "normal",
  "font-variant-numeric": "normal",
  "font-variant-position": "normal",
  "font-variation-settings": "normal",
  "font-weight": "400",
  "grid-auto-columns": "auto",
  "grid-auto-flow": "row",
  "grid-auto-rows": "auto",
  "grid-column-end": "auto",
  "grid-column-start": "auto",
  "grid-row-end": "auto",
  "grid-row-start": "auto",
  "grid-template-areas": "none",
  "grid-template-columns": "none",
  "grid-template-rows": "none",
  height: "0px",
  "hyphenate-character": "auto",
  hyphens: "manual",
  "image-orientation": "from-image",
  "image-rendering": "auto",
  "ime-mode": "auto",
  "inline-size": "0px",
  "inset-block-end": "768px",
  "inset-block-start": "0px",
  "inset-inline-end": "1024px",
  "inset-inline-start": "0px",
  isolation: "auto",
  "justify-content": "normal",
  "justify-items": "normal",
  "justify-self": "auto",
  left: "0px",
  "letter-spacing": "normal",
  "lighting-color": "rgb(255, 255, 255)",
  "line-break": "auto",
  "line-height": "normal",
  "list-style-image": "none",
  "list-style-position": "outside",
  "list-style-type": "disc",
  "margin-block-end": "0px",
  "margin-block-start": "0px",
  "margin-bottom": "0px",
  "margin-inline-end": "0px",
  "margin-inline-start": "0px",
  "margin-left": "0px",
  "margin-right": "0px",
  "margin-top": "0px",
  "marker-end": "none",
  "marker-mid": "none",
  "marker-start": "none",
  "mask-clip": "border-box",
  "mask-composite": "add",
  "mask-image": "none",
  "mask-mode": "match-source",
  "mask-origin": "border-box",
  "mask-position-x": "0%",
  "mask-position-y": "0%",
  "mask-repeat": "repeat",
  "mask-size": "auto",
  "mask-type": "luminance",
  "max-block-size": "none",
  "max-height": "none",
  "max-inline-size": "none",
  "max-width": "none",
  "min-block-size": "0px",
  "min-height": "0px",
  "min-inline-size": "0px",
  "min-width": "0px",
  "mix-blend-mode": "normal",
  "object-fit": "fill",
  "object-position": "50% 50%",
  "offset-anchor": "auto",
  "offset-distance": "0px",
  "offset-path": "none",
  "offset-rotate": "auto",
  opacity: "1",
  order: "0",
  "outline-color": "rgb(0, 0, 0)",
  "outline-offset": "0px",
  "outline-style": "none",
  "outline-width": "0px",
  "overflow-anchor": "auto",
  "overflow-block": "visible",
  "overflow-clip-margin": "0px",
  "overflow-inline": "visible",
  "overflow-wrap": "normal",
  "overflow-x": "visible",
  "overflow-y": "visible",
  "overscroll-behavior-block": "auto",
  "overscroll-behavior-inline": "auto",
  "overscroll-behavior-x": "auto",
  "overscroll-behavior-y": "auto",
  "padding-block-end": "0px",
  "padding-block-start": "0px",
  "padding-bottom": "0px",
  "padding-inline-end": "0px",
  "padding-inline-start": "0px",
  "padding-left": "0px",
  "padding-right": "0px",
  "padding-top": "0px",
  "paint-order": "normal",
  perspective: "none",
  "perspective-origin": "0px 0px",
  "pointer-events": "auto",
  position: "absolute",
  "print-color-adjust": "economy",
  quotes: "auto",
  r: "0px",
  resize: "none",
  right: "1024px",
  rotate: "none",
  "row-gap": "normal",
  "ruby-align": "space-around",
  "ruby-position": "alternate",
  rx: "auto",
  ry: "auto",
  scale: "none",
  "scroll-behavior": "auto",
  "scroll-margin-block-end": "0px",
  "scroll-margin-block-start": "0px",
  "scroll-margin-bottom": "0px",
  "scroll-margin-inline-end": "0px",
  "scroll-margin-inline-start": "0px",
  "scroll-margin-left": "0px",
  "scroll-margin-right": "0px",
  "scroll-margin-top": "0px",
  "scroll-padding-block-end": "auto",
  "scroll-padding-block-start": "auto",
  "scroll-padding-bottom": "auto",
  "scroll-padding-inline-end": "auto",
  "scroll-padding-inline-start": "auto",
  "scroll-padding-left": "auto",
  "scroll-padding-right": "auto",
  "scroll-padding-top": "auto",
  "scroll-snap-align": "none",
  "scroll-snap-stop": "normal",
  "scroll-snap-type": "none",
  "scrollbar-color": "auto",
  "scrollbar-gutter": "auto",
  "scrollbar-width": "auto",
  "shape-image-threshold": "0",
  "shape-margin": "0px",
  "shape-outside": "none",
  "shape-rendering": "auto",
  "stop-color": "rgb(0, 0, 0)",
  "stop-opacity": "1",
  stroke: "none",
  "stroke-dasharray": "none",
  "stroke-dashoffset": "0px",
  "stroke-linecap": "butt",
  "stroke-linejoin": "miter",
  "stroke-miterlimit": "4",
  "stroke-opacity": "1",
  "stroke-width": "1px",
  "tab-size": "8",
  "table-layout": "auto",
  "text-align": "start",
  "text-align-last": "auto",
  "text-anchor": "start",
  "text-combine-upright": "none",
  "text-decoration-color": "rgb(0, 0, 0)",
  "text-decoration-line": "none",
  "text-decoration-skip-ink": "auto",
  "text-decoration-style": "solid",
  "text-decoration-thickness": "auto",
  "text-emphasis-color": "rgb(0, 0, 0)",
  "text-emphasis-position": "over right",
  "text-emphasis-style": "none",
  "text-indent": "0px",
  "text-justify": "auto",
  "text-orientation": "mixed",
  "text-overflow": "clip",
  "text-rendering": "auto",
  "text-shadow": "none",
  "text-transform": "none",
  "text-underline-offset": "auto",
  "text-underline-position": "auto",
  top: "0px",
  "touch-action": "auto",
  transform: "none",
  "transform-box": "border-box",
  "transform-origin": "0px 0px",
  "transform-style": "flat",
  "transition-delay": "0s",
  "transition-duration": "0s",
  "transition-property": "all",
  "transition-timing-function": "ease",
  translate: "none",
  "unicode-bidi": "isolate",
  "user-select": "auto",
  "vector-effect": "none",
  "vertical-align": "baseline",
  visibility: "visible",
  "white-space": "normal",
  width: "0px",
  "will-change": "auto",
  "word-break": "normal",
  "word-spacing": "0px",
  "writing-mode": "horizontal-tb",
  x: "0px",
  y: "0px",
  "z-index": "auto",
};

export const getSelectedId = (designer: DesignerState) => {
  return designer.selectedTargetId;
};

export const isSelectableExpr = (expr: ast.InnerExpressionInfo) => {
  return (
    expr.kind === ast.ExprKind.Atom ||
    expr.kind === ast.ExprKind.Style ||
    expr.kind === ast.ExprKind.Trigger ||
    expr.kind === ast.ExprKind.TextNode ||
    expr.kind === ast.ExprKind.Element ||
    expr.kind === ast.ExprKind.Component
  );
};

export const isStyleableExpr = (expr: ast.InnerExpressionInfo) => {
  return (
    expr.kind === ast.ExprKind.Style ||
    expr.kind === ast.ExprKind.TextNode ||
    expr.kind === ast.ExprKind.Element ||
    expr.kind === ast.ExprKind.Component
  );
};
export const getStyleableTargetId = (designer: DesignerState) => {
  const id = getSelectedId(designer);
  const expr = ast.getExprInfoById(id, designer.graph);
  if (expr?.kind === ast.ExprKind.Component) {
    return ast.getComponentRenderNode(expr.expr)?.expr.id;
  }
  return id;
};

export const getSelectedExprStyles = (
  state: DesignerState
): ComputedStyleMap => {
  const combinedStyles: Record<string, ComputedDeclaration> = {};

  const virtId = getStyleableTargetId(state);

  const ret = { propertyNames: [], map: {} };

  if (!virtId) {
    return ret;
  }

  const exprInfo = ast.getExprInfoById(virtId, state.graph);

  if (exprInfo == null) {
    return ret;
  }

  if (
    exprInfo.kind === ast.ExprKind.Element ||
    exprInfo.kind === ast.ExprKind.TextNode
  ) {
    return ast.computeElementStyle(virtId, state.graph);
  } else if (exprInfo.kind === ast.ExprKind.Style) {
    return ast.computeStyle(exprInfo.expr, state.graph, exprInfo.expr.id, []);
  }

  return ret;
};

export const getSelectedExpression = (state: DesignerState) => {
  return (
    state.selectedTargetId &&
    ast.getExprByVirtId(state.selectedTargetId, state.graph)?.expr
  );
};

export const getSelectedExpressionInfo = (state: DesignerState) => {
  return (
    state.selectedTargetId &&
    ast.getExprInfoById(state.selectedTargetId, state.graph)
  );
};

export const getActiveVariant = (state: DesignerState) => {
  return (
    state.activeVariantId &&
    (ast.getExprByVirtId(state.activeVariantId, state.graph) as Variant)
  );
};

export const getFrameBoxes = memoize(
  (boxes: Record<string, Box>, frameIndex: number) => {
    const v = pickBy(boxes, (value: Box, key: string) => {
      return key.indexOf(String(frameIndex)) === 0;
    });
    return v;
  }
);
export const getPreviewChildren = (frame: HTMLDocument) => {
  return frame.children;
};

export const getSelectedExprOwnerComponent = (state: DesignerState) => {
  if (!state.selectedTargetId) {
    return null;
  }
  const expr = ast.getExprByVirtId(state.selectedTargetId, state.graph)?.expr;
  if (!expr) {
    return null;
  }

  return ast.getExprOwnerComponent(expr, state.graph);
};

export const getAllStyleMixins = (state: DesignerState) => {};

export const getAllPublicStyleMixins = (state: DesignerState) => {
  return ast.getGraphStyleMixins(state.graph);
};

export const getGraph = (state: DesignerState) => state.graph;

export const getCurrentDependency = (state: DesignerState) => {
  return state.graph.dependencies[getCurrentFilePath(state)];
};

export const getAllPublicAtoms = (state: DesignerState) => {
  return ast.getGraphAtoms(state.graph);
};

export const getSelectedVariantIds = (state: DesignerState) =>
  state.selectedVariantIds;

export const getSelectedExprAvailableVariants = (state: DesignerState) => {
  const ownerComponent = getSelectedExprOwnerComponent(state);
  if (!ownerComponent) {
    return [];
  }
  return ast.getComponentVariants(ownerComponent) || [];
};

export const getEnabledVariants = (state: DesignerState) => {
  return getSelectedExprAvailableVariants(state).filter(ast.isVariantEnabled);
};

export const findVirtId = (
  id: string,
  state: DesignerState | WritableDraft<DesignerState>
) => {
  if (virtHTML.getNodeById(id, state.currentDocument.paperclip.html)) {
    return id;
  }

  let idParts = id.split(".");

  let curr = ast.getExprInfoById(idParts[idParts.length - 1], state.graph);

  // IF a component, then we want to fetch the render node that IS visible
  if (curr?.kind === ast.ExprKind.Component) {
    curr = ast.getComponentRenderNode(curr.expr);
    if (curr) {
      idParts = [curr.expr.id];
    } else {
      // NO virt ID present
      return null;
    }
  }

  // assume it's an instance
  while (curr?.kind === ast.ExprKind.Element) {
    const component = ast.getInstanceComponent(curr.expr, state.graph);
    if (!component) {
      break;
    }
    const renderNode = ast.getComponentRenderNode(component);
    if (renderNode) {
      idParts.push(renderNode.expr.id);
      curr = renderNode;
    } else {
      break;
    }
  }

  return idParts.join(".");
};

/**
 * Safer utility fn that expands
 */

export const findVirtNode = (
  id: string,
  state: DesignerState | WritableDraft<DesignerState>
) => {
  return virtHTML.getNodeById(
    findVirtId(id, state),
    state.currentDocument.paperclip.html
  );
};

export const getExprBounds = (state: DesignerState): Bounds => {
  const node =
    state.currentDocument &&
    (findVirtNode(state.selectedTargetId, state) as any as
      | VirtElement
      | VirtText);

  return node?.metadata?.bounds;
};

export const setSelectedNodeBounds = (
  newBounds: Bounds,
  state: DesignerState
) => {
  return produce(state, (newState) => {
    const node = findVirtNode(newState.selectedTargetId, newState) as any as
      | VirtElement
      | VirtText;

    const path = virtHTML.getNodePath(
      node,
      newState.currentDocument.paperclip.html
    );
    if (!node.metadata) {
      node.metadata = {};
    }
    if (!node.metadata.bounds) {
      node.metadata.bounds = { x: 0, y: 0, width: 0, height: 0 };
    }

    node.metadata.bounds = {
      ...newBounds,
    };
  });
};

const getExprVirtId = (
  current: ast.InnerExpressionInfo,
  instancePath: string[],
  graph: Graph
) => {
  let parts: string[] = [current.expr.id];
  let curr = current;

  while (
    curr.kind === ast.ExprKind.Element &&
    ast.isInstance(curr.expr, graph)
  ) {
    const component = ast.getInstanceComponent(curr.expr, graph);
    curr = ast.getComponentRenderNode(component);

    if (ast.isInstance(curr.expr, graph)) {
      parts.push(curr.expr.id);
    }
  }

  return [...instancePath, ...parts].join(".");
};

// const findInsertBoxesAtPoint = (
//   point: Point,
//   instance: Element,
//   graph: Graph,
//   rects: Record<string, Box>
// ): BoxNodeInfo => {
//   const component = ast.getInstanceComponent(instance, graph);
//   const slots = ast.getComponentSlots(component, graph);
//   for (const slot of slots) {
//     const insertId = instance.id + "." + slot.id;
//     const rect = rects[insertId];
//     if (rect && boxIntersectsPoint(rect, point)) {
//       return {
//         nodeId: insertId,
//         box: rect,
//       };
//     }
//   }

//   // const slotBoxes = getSlotBoxes(instance, graph, rects);
//   // for (const id in slotBoxes) {
//   //   const box = slotBoxes[id];

//   // }

//   return null;
// };

/*

1. 
*/

const findVirtBoxNodeInfo = (
  point: Point,
  current: ast.InnerExpressionInfo,
  graph: Graph,
  scopeId: string,
  instancePath: string[],
  boxes: Record<string, Box>
): BoxNodeInfo | null => {
  const virtId = [...instancePath, current.expr.id].join(".");

  if (
    current.kind === ast.ExprKind.Element &&
    ast.isInstance(current.expr, graph)
  ) {
    const component = ast.getInstanceComponent(current.expr, graph);
    const subInstancePath = [...instancePath, current.expr.id];

    // Scoped in the shadow? Look for children there
    if (scopeId?.includes(virtId)) {
      const render = ast.getComponentRenderNode(component);
      const boxInfo = findVirtBoxNodeInfo(
        point,
        render,
        graph,
        scopeId,
        subInstancePath,
        boxes
      );
      if (boxInfo) {
        return boxInfo;
      }
    }

    // Expose slot information if at the root so
    if (instancePath.length === 0) {
      const slots = ast.getComponentSlots(component, graph);

      for (const slot of slots) {
        const boxInfo = calcExprBoxInfo(
          { kind: ast.ExprKind.Slot, expr: slot },
          virtId + "." + slot.id,
          point,
          subInstancePath,
          boxes,
          graph
        );
        if (boxInfo) {
          return boxInfo;
        }
      }
    }
  }

  for (const child of ast.getChildren(current)) {
    const childInfo = findVirtBoxNodeInfo(
      point,
      child,
      graph,
      scopeId,
      instancePath,
      boxes
    );
    if (childInfo) {
      return childInfo;
    }
  }

  return calcExprBoxInfo(current, virtId, point, instancePath, boxes, graph);
};

const calcExprBoxInfo = (
  current: ast.InnerExpressionInfo,
  virtId: string,
  point: Point,
  instancePath: string[],
  rects: Record<string, Box>,
  graph: Graph
) => {
  // not all expressions have box information, so we need to calculate
  const box = calcExprBox(current, instancePath, rects, graph);

  return (
    box &&
    boxIntersectsPoint(box, point) && {
      nodeId: virtId,
      box,
    }
  );
};

const calcExprBox = memoize(
  (
    current: ast.InnerExpressionInfo,
    instancePath: string[],
    rects: Record<string, Box>,
    graph: Graph
  ) => {
    const virtId = [...instancePath, current.expr.id].join(".");

    // IF the rect exists, then it's a render node, just return it
    if (rects[virtId]) {
      return rects[virtId];
    }

    // OTHERWISE we're dealing with an expression such as a component, instance, slot, or insert
    // Check for INSTANCES
    if (
      current.kind === ast.ExprKind.Element &&
      ast.isInstance(current.expr, graph)
    ) {
      const component = ast.getInstanceComponent(
        current.expr as pc.Element,
        graph
      );

      return calcExprBox(
        ast.getComponentRenderNode(component),
        [...instancePath, current.expr.id],
        rects,
        graph
      );

      // Check for COMPONENTS
    } else if (current.kind === ast.ExprKind.Component) {
      return calcExprBox(
        ast.getComponentRenderNode(current.expr as pc.Component),
        instancePath,
        rects,
        graph
      );

      // Check for INSERTS (part of instances)
    } else if (current.kind === ast.ExprKind.Insert) {
      const boxes = current.expr.body
        .map((child) =>
          calcExprBox(ast.getChildExprInner(child), instancePath, rects, graph)
        )
        .filter(Boolean);
      return boxes.length > 0 ? mergeBoxes(boxes) : null;
    } else if (current.kind === ast.ExprKind.Slot) {
      const boxes = current.expr.body
        .map((child) =>
          calcExprBox(ast.getChildExprInner(child), instancePath, rects, graph)
        )
        .filter(Boolean);
      return boxes.length > 0 ? mergeBoxes(boxes) : null;
    } else if (current.kind === ast.ExprKind.Render) {
      return calcExprBox(
        ast.getChildExprInner(current.expr.node),
        instancePath,
        rects,
        graph
      );
    }
  }
);

// const findVirtBoxNodeInfo = (
//   point: Point,
//   current: ast.InnerExpressionInfo,
//   path: string,
//   graph: Graph,
//   scopeId: string,
//   instancePath: string[],
//   boxes: Record<string, Box>
// ): BoxNodeInfo | null => {
//   const virtId = getExprVirtId(current, instancePath, graph);

//   if (
//     current.kind === ast.ExprKind.Element &&
//     ast.isInstance(current.expr, graph)
//   ) {
//     // return boxes
//     if (!instancePath.length) {
//       const info = findInsertBoxesAtPoint(point, current.expr, graph, boxes);
//       if (info) {
//         return info;
//       }
//     }

//     if (scopeId?.includes(virtId)) {
//       const component = ast.getInstanceComponent(current.expr, graph);
//       const render = ast.getComponentRenderNode(component);
//       const boxInfo = findVirtBoxNodeInfo(
//         point,
//         render,
//         path,
//         graph,
//         scopeId,
//         [...instancePath, virtId],
//         boxes
//       );
//       if (boxInfo) {
//         return boxInfo;
//       }
//     }
//   }

//   const box = boxes[virtId];

//   for (const child of ast.getChildren(current)) {
//     const childInfo = findVirtBoxNodeInfo(
//       point,
//       child,
//       path,
//       graph,
//       scopeId,
//       instancePath,
//       boxes
//     );
//     if (childInfo) {
//       return childInfo;
//     }
//   }

//   return (
//     box &&
//     boxIntersectsPoint(box, point) && {
//       nodeId: virtId,
//       box,
//     }
//   );
// };

export const getNodeInfoAtCurrentPoint = (state: DesignerState) => {
  if (!state.canvas.mousePosition) {
    return null;
  }

  const scaledPoint = getScaledPoint(
    state.canvas.mousePosition,
    state.canvas.transform
  );

  const filePath = getCurrentFilePath(state);

  const dep = state.graph.dependencies[filePath];

  if (!dep) {
    return null;
  }

  const info = findVirtBoxNodeInfo(
    scaledPoint,
    { expr: dep.document, kind: ast.ExprKind.Document },
    state.graph,
    state.scopedElementId,
    [],
    state.rects
  );

  return info;
};

const getAllRectsAtPoint = (point: Point, rects: Record<string, FrameBox>) => {
  const overlappingRects: Record<string, FrameBox> = {};
  for (const virtId in rects) {
    const rect = rects[virtId];
    if (boxIntersectsPoint(rect, point)) {
      overlappingRects[virtId] = rect;
    }
  }
  return overlappingRects;
};

const findTargetNodeBoxInfo = (
  overlappingRects: Record<string, FrameBox>,
  filePath: string,
  graph: Graph,
  scopedId: string
): BoxNodeInfo => {
  return null;
};

const merge = memoize((a, b) => ({ ...a, ...b }));

// const getVirtWithExprRects = (designer: DesignerState) =>
//   merge(
//     designer.rects,
//     merge(
//       getInsertBoxes(
//         designer.graph,
//         getCurrentFilePath(designer),
//         designer.currentDocument?.paperclip.html,
//         designer.rects
//       ),
//       merge(
//         getInstanceBoxes(designer.rects),
//         getGraphComponentRects(designer.graph, designer.rects)
//       )
//     )
//   );

const getGraphComponentRects = memoize(
  (graph: Graph, rects: Record<string, FrameBox>) => {
    const allComponentRects = {};
    for (const path in graph.dependencies) {
      const dep = graph.dependencies[path];
      const components = ast.getDocumentComponents(dep.document);
      for (const component of components) {
        Object.assign(
          allComponentRects,
          getComponentRects(component, rects, graph)
        );
      }
    }

    return allComponentRects;
  }
);

const getComponentRects = (
  component: Component,
  rects: Record<string, FrameBox>,
  graph: Graph
): Record<string, FrameBox> => {
  const componentRects: Record<string, FrameBox> = {};

  const renderNode = ast.getComponentRenderNode(component);
  const renderNodeRect = rects[renderNode?.expr.id];
  if (!renderNodeRect) {
    return;
  }

  componentRects[component.id] = rects[renderNode.expr.id];

  // DELETE render node since the component should always be selected
  // delete newState.rects[renderNode.expr.id];
  const slots = ast.getComponentSlots(component, graph);

  for (const slot of slots) {
    Object.assign(
      componentRects,
      getSlotRects(slot, renderNodeRect.frameIndex, rects)
    );
  }

  return componentRects;
};

const getSlotRects = (
  slot: pc.Slot,
  frameIndex: number,
  rects: Record<string, FrameBox>
) => {
  const slotDescendents = ast.flattenSlot(slot);

  const slotRects = {};

  const descendantRects: Box[] = [];
  for (const id in slotDescendents) {
    const expr = slotDescendents[id];
    if (
      expr.kind === ast.ExprKind.TextNode ||
      expr.kind === ast.ExprKind.Element
    ) {
      const rect = rects[expr.expr.id];
      if (rect) {
        descendantRects.push(rect);
      }
    }

    slotRects[slot.id] = {
      frameIndex,
      ...mergeBoxes(descendantRects),
    };
  }

  return slotRects;
};

const getInstanceBoxes = memoize(
  (rects: Record<string, FrameBox>): Record<string, FrameBox> => {
    const instanceBoxes: Record<string, FrameBox> = {};

    for (const id in rects) {
      const rect = rects[id];
      if (id.includes(".")) {
        const idParts = id.split(".");
        for (let i = 0, n = idParts.length - 1; i < n; i++) {
          const instanceId = idParts.slice(i, 1).join(".");
          instanceBoxes[instanceId] = instanceBoxes[instanceId]
            ? (mergeBoxes([rect, instanceBoxes[instanceId]]) as FrameBox)
            : rect;
          instanceBoxes[instanceId].frameIndex = rect.frameIndex;
        }
      }
    }

    return instanceBoxes;
  }
);

export const findInsertAtPoint = (
  point: Point,
  state: DesignerState
): BoxNodeInfo | null => {
  const insertBoxes = getInsertBoxes(
    state.graph,
    getCurrentFilePath(state),
    state.currentDocument!.paperclip.html,
    state.rects
  );

  for (const insertId in insertBoxes) {
    if (boxIntersectsPoint(insertBoxes[insertId], point)) {
      return {
        nodeId: insertId,
        box: insertBoxes[insertId],
      };
    }
  }
  return null;
};

export const getAllFrameBounds = (designer: DesignerState) => {
  return mergeBoxes(getCurrentPreviewFrameBoxes(designer));
};
export const getInsertBoxes = memoize(
  (
    graph: Graph,
    currentPath: string,
    currentDocument: HTMLDocument,
    rects: Record<string, Box>
  ) => {
    const dep = graph.dependencies[currentPath];

    if (!dep || !currentDocument) {
      return {};
    }

    const slotBoxes: Record<string, Box> = {};

    const instances = Object.values(ast.flattenDocument(dep.document))
      .filter(
        (node) =>
          node.kind === ast.ExprKind.Element && ast.isInstance(node.expr, graph)
      )
      .map((node) => node.expr) as Element[];

    for (const instance of instances) {
      const component = ast.getInstanceComponent(instance, graph);
      const slots = ast.getComponentSlots(component, graph);
      const virtId = instance.id;

      for (const slot of slots) {
        const containsInsert = instance.body.some(
          (child) => child.insert?.name === slot.name
        );

        // skip since we want the children of this insert to be insertable
        if (containsInsert) {
          continue;
        }

        const slotDescendents = Object.values(ast.flattenSlot(slot));

        const boxes: Box[] = [];
        for (const descendent of slotDescendents) {
          const rect = rects[virtId + "." + descendent.expr.id];
          if (rect) {
            boxes.push(rect);
          }
        }
        slotBoxes[virtId + "." + slot.id] = mergeBoxes(boxes);
      }
    }

    return slotBoxes;
  }
);
const getInnerNode = (node: Node) => node.element || node.textNode;

export const getCurrentPreviewFrameBoxes = (editor: DesignerState) => {
  const preview = editor.currentDocument?.paperclip?.html;

  return preview ? getPreviewFrameBoxes(preview).filter(Boolean) : [];
};

export const getPreviewFrameBoxes = (preview: HTMLDocument) => {
  const currentPreview = preview;
  const frameBoxes = getPreviewChildren(currentPreview).map((frame: Node) => {
    const metadata = getInnerNode(frame).metadata;
    const box = metadata?.bounds || DEFAULT_FRAME_BOX;
    if (metadata?.visible === false) {
      return null;
    }
    return { ...DEFAULT_FRAME_BOX, ...box };
  });

  return frameBoxes;
};

export const highlightNode = (
  designer: DesignerState,
  mousePosition: Point
) => {
  return produce(designer, (newDesigner) => {
    newDesigner.canvas.mousePosition = mousePosition;
    const info = getNodeInfoAtCurrentPoint(designer);

    newDesigner.highlightedNodeId = info?.nodeId;
  });
};

export const getCurrentDocument = (state: DesignerState) =>
  state.currentDocument;

export const getCurrentDocumentImports = (state: DesignerState) =>
  ast.getDocumentImports(
    state.graph.dependencies[getCurrentFilePath(state)].document
  );

export const getHighlightedNodeBox = (state: DesignerState): Box => {
  return getNodeBox(state.highlightedNodeId, state);
};

export const getSelectedNodeBox = (state: DesignerState): Box =>
  getNodeBox(state.selectedTargetId, state);

export const getNodeBox = (virtId: string, state: DesignerState): Box => {
  if (!virtId) {
    return null;
  }

  const nodePath = virtId.split(".");
  const instancePath = nodePath.slice(0, nodePath.length - 1);
  const expr = ast.getExprInfoById(nodePath[nodePath.length - 1], state.graph);
  const box = expr && calcExprBox(expr, instancePath, state.rects, state.graph);
  return box;
};

export const getAllComponents = (state: DesignerState) => {
  return getGraphComponents(state.graph);
};

export const getGraphComponents = (graph: Graph) => {
  const allComponents: ComponentInfo[] = [];
  for (const path in graph.dependencies) {
    allComponents.push(
      ...ast
        .getDocumentComponents(graph.dependencies[path].document)
        .map((component) => ({
          sourcePath: path,
          component,
        }))
    );
  }
  return allComponents;
};
type MixinInfo = {
  name: string;
  mixinId: string;
};

const getDocumentMixins = (doc: pc.Document): pc.Style[] => {
  return doc.body.filter((item) => item.style).map((item) => item.style);
};

export const getCurrentStyleMixins = (state: DesignerState): MixinInfo[] => {
  const dep = getCurrentDependency(state);
  return getStyleMixinRefs(state)
    .map((ref) => {
      const refDep =
        ref.path.length === 1
          ? dep
          : state.graph.dependencies[
              dep.imports[
                dep.document.body.find((item) => {
                  return item.import?.namespace === ref.path[0];
                }).import.path
              ]
            ];

      if (!refDep) {
        return null;
      }

      const mixin = getDocumentMixins(refDep.document).find(
        (item) => item.name === ref.path[ref.path.length - 1]
      );

      if (mixin) {
        return {
          name: mixin.name,
          mixinId: mixin.id,
        };
      }
    })
    .filter(Boolean);
};

const getStyleMixinRefs = (state: DesignerState): Reference[] => {
  const expr = ast.getExprInfoById(state.selectedTargetId, state.graph);
  if (!expr) {
    return [];
  }

  const selectedVariants: Variant[] = state.selectedVariantIds.map((id) =>
    ast.getExprById(id, state.graph)
  );

  if (expr.kind === ast.ExprKind.Element) {
    const variantStyle = expr.expr.body.find((item) => {
      return (
        item.style &&
        item.style.variantCombo.length === selectedVariants.length &&
        item.style.variantCombo.every((ref) => {
          return (
            ref.path.length === 1 &&
            selectedVariants.some((variant) => variant.name === ref.path[0])
          );
        })
      );
    });

    return variantStyle?.style?.extends || [];
  } else if (expr.kind === ast.ExprKind.Style) {
    return expr.expr.extends;
  }

  return [];
};

export const getComponentSlots = memoize((component: Component): pc.Slot[] => {
  return Object.values(ast.flattenComponent(component))
    .filter((descendent) => {
      return descendent.kind === ast.ExprKind.Slot;
    })
    .map((descendent) => {
      return descendent.expr;
    });
});

// const getSlotBoxes = memoize((instance: Element, graph: Graph, rects: Record<string, Box>) => {
//   const component = ast.getInstanceComponent(instance, graph);
//   const slots = ast.getComponentSlots(component, graph);

//   const slotBoxes: Record<string, Box> = {};

//   for (const slot of slots) {
//     const slotDescendents = Object.values(ast.flattenSlot(slot));

//       const instanceSource = ast.getExprById(instance.id, graph) as Element;

//       const containsInsert = instanceSource.body.some(child => child.insert?.name === slot.name);

//       // skip since we want the children of this insert to be insertable
//       if (containsInsert) {
//         continue;
//       }

//       const boxes: Box[] = [];
//       for (const descendent of slotDescendents) {
//         const rect = rects[instance.id + "." + descendent.expr.id];
//         if (rect) {
//           boxes.push(rect);
//         }
//       }
//       slotBoxes[slot.id] = mergeBoxes(boxes);
//     }
//   return slotBoxes
// })

// export const expandInstanceRects = (state: DesignerState) => {
//   return produce(state, newState => {
//     for (const nodeId in newState.rects) {
//       if (nodeId.includes(".")) {
//         const nodePath = nodeId.split(".");
//         for (let i = 0, {length} = nodePath; i < length - 1; i++) {
//           newState.rects[nodePath.slice(0, i + 1).join(".")] = newState.rects[nodeId];
//         }
//       }
//     }
//   });
// }
