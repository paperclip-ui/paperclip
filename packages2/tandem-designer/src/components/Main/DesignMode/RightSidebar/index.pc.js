import React from "react";
import _pub94C7Bc1B, {
  Preview as _pub94C7Bc1B_Preview,
} from "./CSSInspector/index.pc";
import _pubAa109E70 from "../../../ResizableContainer/index.pc";
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

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      _pubAa109E70,
      {
        class: "_d783348e _3037cf6a _pub-3037cf6a",
        ref: ref,
        right: true,
        fixedSize: true,
        scrollable: true,
      },
      React.createElement(
        _pub94C7Bc1B_Preview,
        {
          class: "_b499ded9 _3037cf6a _pub-3037cf6a",
          showComputed: props["showComputed"],
        },
        null
      )
    );
  })
);
export { Preview };
