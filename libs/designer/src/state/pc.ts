import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { Variant } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { EditorState } from "./core";

export const MIXED_VALUE = "mixed";

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

export const getSelectedExprStyles = (
  state: EditorState
): ComputedDeclaration[] => {
  const combinedStyles: Record<string, ComputedDeclaration> = {};

  const virtId = state.selectedVirtNodeId;
  if (!virtId) {
    return [];
  }
  const exprStyle = ast.computeElementStyle(virtId, state.graph);
  const computedStyle = state.computedStyles[virtId];

  if (!computedStyle) {
    return [];
  }

  // not all props are computed (like gap), so we pull from constant that contains ALL CSS props
  // instead.
  for (const name in AVAILABLE_STYLES) {
    const computedValue = computedStyle[name];
    const explicitValue =
      exprStyle[name] && ast.serializeDeclaration(exprStyle[name]);

    if (
      combinedStyles[name] != null &&
      combinedStyles[name].computedValue !== computedValue
    ) {
      combinedStyles[name].computedValue = MIXED_VALUE;
    } else {
      combinedStyles[name] = {
        name,
        isDefault: computedValue === AVAILABLE_STYLES[name],
        isExplicitlyDefined: exprStyle[name] != null,
        computedValue,
        value: computedValue || explicitValue,
        explicitValue,
      };
    }
  }

  return Object.values(combinedStyles);
};

export const getSelectedExpression = (state: EditorState) => {
  return (
    state.selectedVirtNodeId &&
    ast.getExprByVirtId(state.selectedVirtNodeId, state.graph)
  );
};

export const getActiveVariant = (state: EditorState) => {
  return (
    state.activeVariantId &&
    (ast.getExprByVirtId(state.activeVariantId, state.graph) as Variant)
  );
};

export const getSelectedExprOwnerComponent = (state: EditorState) => {
  if (!state.selectedVirtNodeId) {
    return null;
  }
  const expr = ast.getExprByVirtId(state.selectedVirtNodeId, state.graph);
  if (!expr) {
    return null;
  }

  return ast.getExprOwnerComponent(expr, state.graph);
};

export const getSelectedExprAvailableVariants = (state: EditorState) => {
  const ownerComponent = getSelectedExprOwnerComponent(state);
  if (!ownerComponent) {
    return [];
  }
  return ast.getComponentVariants(ownerComponent) || [];
};

export const getEnabledVariants = (state: EditorState) => {
  return getSelectedExprAvailableVariants(state).filter(ast.isVariantEnabled);
};
