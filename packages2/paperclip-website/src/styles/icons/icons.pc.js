import React from "react";
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

var Icon = React.memo(
  React.forwardRef(function Icon(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_ff6c0d01 _9f273410 _pub-9f273410" +
          " " +
          "_9f273410_icon _pub-9f273410_icon icon " +
          (props["class"] ? " " + props["class"] : "") +
          " " +
          " " +
          (props["className"] ? " " + props["className"] : ""),
        ref: ref,
        "data-name": props["name"],
      },
      null
    );
  })
);
export { Icon };
