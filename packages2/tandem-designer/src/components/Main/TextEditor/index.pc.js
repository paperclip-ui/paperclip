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

var TextEditor = React.memo(
  React.forwardRef(function TextEditor(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_eef01e41 _8f0c125e _pub-8f0c125e",
        ref: ref,
      },
      "Text editor here"
    );
  })
);
export { TextEditor };
