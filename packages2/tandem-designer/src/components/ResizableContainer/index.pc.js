import React from "react";
import _pub1B5D7030 from "../../../../tandem-design-system/src/atoms.pc";
function getDefault(module) {
  return module.default || module;
}

function castStyle(value) {
  var tov = typeof value;
  if (tov === "object" || tov !== "string" || !value) return value;
  return value
    .trim()
    .split(";")
    .reduce(function (obj, keyValue) {
      var kvp = keyValue.split(":");
      var key = kvp[0];
      var value = kvp[1];
      if (!value || value === "undefined") return obj;
      var trimmedValue = value.trim();
      if (trimmedValue === "undefined" || !trimmedValue) return obj;
      obj[key.trim()] = trimmedValue;
      return obj;
    }, {});
}

export const classNames = {};

var $$Default = React.memo(
  React.forwardRef(function $$Default(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_2d42c187 _aa109e70 _pub-aa109e70" +
          (props["class"] ? " " + props["class"] : "") +
          (props["scrollable"]
            ? " " + "_aa109e70_scrollable _pub-aa109e70_scrollable scrollable"
            : "") +
          (props["disabled"]
            ? " " + "_aa109e70_disabled _pub-aa109e70_disabled disabled"
            : "") +
          (props["dragging"]
            ? " " + "_aa109e70_dragging _pub-aa109e70_dragging dragging"
            : "") +
          (props["right"]
            ? " " + "_aa109e70_right _pub-aa109e70_right right"
            : "") +
          (props["left"]
            ? " " + "_aa109e70_left _pub-aa109e70_left left"
            : "") +
          (props["bottom"]
            ? " " + "_aa109e70_bottom _pub-aa109e70_bottom bottom"
            : "") +
          (props["fixedSize"]
            ? " " + "_aa109e70_fixed-size _pub-aa109e70_fixed-size fixed-size"
            : ""),
        ref: ref,
        style: castStyle(props["style"]),
        "data-label": "Resizable",
      },
      React.createElement(
        "div",
        {
          className: "_3185c878 _aa109e70 _pub-aa109e70",
          "data-label": "Bar",
        },
        React.createElement(
          "div",
          {
            className: "_4274c0d3 _aa109e70 _pub-aa109e70",
            onMouseDown: props["onBarDown"],
          },
          null
        )
      ),
      React.createElement(
        "div",
        {
          className: "_4682f8ee _aa109e70 _pub-aa109e70",
          "data-label": "Container",
        },
        props["children"]
      )
    );
  })
);
export default $$Default;
