import { memoize } from "@paperclip-ui/common";
import { css, schema } from "./types";

const defaultOptions: schema.Field<css.Input> = {
  input: { type: css.InputType.Raw },
};

export const cssSchema: schema.Map<css.Input> = [
  {
    name: "position",
    group: "layout",

    input: {
      name: "left",
      type: css.InputType.Enum,
      options: ["relative", "absolute", "static", "fixed"],
    },
  },
  {
    name: "left",
    group: "layout",

    input: { name: "left", type: css.InputType.Unit },
  },
  {
    name: "border-radius",
    group: "style",

    input: { name: "left", type: css.InputType.Unit },
  },
  {
    name: "top",
    group: "layout",

    input: { name: "height", type: css.InputType.Unit },
  },
  {
    name: "width",
    group: "layout",

    input: { name: "width", type: css.InputType.Unit },
  },
  {
    name: "height",
    group: "layout",

    input: { name: "height", type: css.InputType.Unit },
  },

  // Padding
  { name: "padding-left", alias: "padding" },
  { name: "padding-top", alias: "padding" },
  { name: "padding-right", alias: "padding" },
  { name: "padding-bottom", alias: "padding" },
  {
    name: "padding",
    group: "layout",

    join: {
      padding: [
        "padding-left",
        "padding-right",
        "padding-top",
        "padding-bottom",
      ],
    },
    input: { name: "padding", type: css.InputType.Unit },
  },

  { name: "margin-left", alias: "margin" },
  { name: "margin-right", alias: "margin" },
  { name: "margin-top", alias: "margin" },
  { name: "margin-bottom", alias: "margin" },
  {
    name: "margin",
    group: "layout",

    join: {
      margin: ["margin-left", "margin-right", "margin-top", "margin-bottom"],
    },
    input: { name: "margin", type: css.InputType.Unit },
  },
  {
    name: "box-sizing",
    group: "layout",

    input: {
      name: "box-sizing",
      type: css.InputType.Enum,
      options: ["border-box", "content-box"],
    },
  },
  {
    name: "display",
    group: "layout",

    input: {
      name: "display",
      type: css.InputType.Enum,
      // https://www.w3schools.com/cssref/pr_class_display.php
      options: [
        "inline",
        "block",
        "contents",
        "flex",
        "grid",
        "inline-block",
        "inline-flex",
        "inline-grid",
        "inline-table",
        "list-item",
        "run-in",
        "table",
        "table-caption",
        "table-column-group",
        "table-header-group",
        "table-footer-group",
        "table-row-group",
        "table-cell",
        "table-column",
        "table-row",
        "none",
        "initial",
        "inherit",
      ],
    },
  },
  {
    name: "cursor",

    input: {
      name: "cursor",
      type: css.InputType.Enum,
      // https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
      options: [
        "auto",
        "default",
        "none",
        "context-menu",
        "help",
        "pointer",
        "progress",
        "wait",
        "cell",
        "crosshair",
        "text",
        "vertical-text",
        "alias",
        "copy",
        "move",
        "no-drop",
        "not-allowed",
        "grab",
        "grabbing",
        "all-scroll",
        "col-resize",
        "row-resize",
        "n-resize",
        "e-resize",
        "s-resize",
        "ne-resize",
        "nw-resize",
        "se-resize",
        "sw-resize",
        "ew-resize",
        "ns-resize",
        "nesw-resize",
        "nwsw-resize",
        "nwse-resize",
        "zoom-in",
        "zoom-out",
      ],
    },
  },
  {
    name: "justify-content",
    group: "layout",

    input: {
      name: "justify-content",
      type: css.InputType.Enum,
      options: ["space-between"],
    },
  },
  {
    name: "align-items",
    group: "layout",

    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["flex-start", "flex-end", "center", "baseline", "stretch"],
    },
  },
  {
    name: "flex-direction",
    group: "layout",

    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["row", "column"],
    },
  },
  {
    name: "flex-wrap",
    group: "layout",

    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["nowrap", "wrap", "wrap-reverse", "inherit"],
    },
  },
  {
    name: "gap",
    group: "layout",

    input: { name: "gap", type: css.InputType.Unit },
  },

  {
    name: "font-family",
    group: "typography",

    input: { name: "font-family", type: css.InputType.Enum, options: [] },
  },
  {
    name: "font-size",
    group: "typography",

    input: { name: "font-size", type: css.InputType.Unit },
  },
  {
    name: "color",
    group: "typography",

    input: { name: "color", type: css.InputType.Color },
  },

  // Border
  { name: "border-left-width", alias: "border" },
  { name: "border-left-color", alias: "border" },
  {
    name: "border",

    join: {
      "border-width": [
        "border-left-width",
        "border-top-width",
        "border-right-width",
        "border-bottom-width",
      ],
      "border-color": [
        "border-left-color",
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
      ],
      "border-radius": [
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius",
      ],
    },
    input: {
      type: css.InputType.Group,
      inputs: [
        { name: "border-color", type: css.InputType.Color },
        { name: "border-width", type: css.InputType.Unit },
        { name: "border-radius", type: css.InputType.Unit },
      ],
    },
  },

  { name: "background-color", alias: "background" },
  { name: "background-image", alias: "background" },
  { name: "background-repeat", alias: "background" },

  // Background
  {
    name: "background",

    list: true,
    input: { name: "background", type: css.InputType.Color },
  },
  defaultOptions,
];

export const getPropField = memoize((name: string): schema.Field<css.Input> => {
  const options =
    cssSchema.find((option) => option.name === name) || defaultOptions;
  if (options.alias) {
    return getPropField(options.alias);
  }
  return options;
});
