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

var Box = React.memo(
  React.forwardRef(function Box(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_e0228b3e _52e6e4ad _pub-52e6e4ad" +
          " " +
          "_52e6e4ad_box _pub-52e6e4ad_box box" +
          (props["left"]
            ? " " + "_52e6e4ad_box--left _pub-52e6e4ad_box--left box--left"
            : "") +
          (props["right"]
            ? " " + "_52e6e4ad_box--right _pub-52e6e4ad_box--right box--right"
            : "") +
          (props["top"]
            ? " " + "_52e6e4ad_box--top _pub-52e6e4ad_box--top box--top"
            : "") +
          (props["bottom"]
            ? " " +
              "_52e6e4ad_box--bottom _pub-52e6e4ad_box--bottom box--bottom"
            : ""),
        ref: ref,
        style: castStyle(props["style"]),
      },
      props["children"]
    );
  })
);
export { Box };
