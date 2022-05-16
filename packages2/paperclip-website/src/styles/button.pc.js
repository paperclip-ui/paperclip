import React from "react";
import _pub62Dca9E0 from "./typography.pc";
import _pubD9B10930 from "./colors.pc";
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

var Anchor = React.memo(
  React.forwardRef(function Anchor(props, ref) {
    return React.createElement(
      "a",
      {
        className:
          "_bf5affcb _2492cc10 _pub-2492cc10 _pub-62dca9e0" +
          " " +
          "_2492cc10__button _pub-2492cc10__button _pub-62dca9e0__button _button " +
          (props["class"] ? " " + props["class"] : "") +
          " " +
          " " +
          (props["className"] ? " " + props["className"] : "") +
          (props["secondary"]
            ? " " +
              "_2492cc10__button--secondary _pub-2492cc10__button--secondary _pub-62dca9e0__button--secondary _button--secondary"
            : "") +
          (props["hover"]
            ? " " +
              "_2492cc10_hover _pub-2492cc10_hover _pub-62dca9e0_hover hover"
            : "") +
          (props["strong"]
            ? " " +
              "_2492cc10__button--strong _pub-2492cc10__button--strong _pub-62dca9e0__button--strong _button--strong"
            : ""),
        ref: ref,
        href: props["href"],
      },
      props["children"]
    );
  })
);
export { Anchor };
