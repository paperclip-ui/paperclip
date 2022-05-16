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

var ComputedStylePanel = React.memo(
  React.forwardRef(function ComputedStylePanel(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_13e40d8b _df1627a7 _pub-df1627a7",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_96eb66f3 _df1627a7 _pub-df1627a7",
        },
        "Computed CSS"
      )
    );
  })
);
export { ComputedStylePanel };
