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

var SecretMessage = React.memo(
  React.forwardRef(function SecretMessage(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_32c5cc24 _179b1104 _pub-179b1104",
        ref: ref,
      },
      "I'm a secret!"
    );
  })
);
export { SecretMessage };
