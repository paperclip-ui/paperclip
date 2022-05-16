import React from "react";
import _pub8Fb9Fe6F from "./test.pc";
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
        className: "_d8315350 _3c4e914a _pub-3c4e914a",
        ref: ref,
      },
      "\n  Some Module\n  ",
      React.createElement(
        _pub8Fb9Fe6F,
        {
          class: "_78f4cd01 _3c4e914a _pub-3c4e914a",
        },
        null
      )
    );
  })
);
export default $$Default;
