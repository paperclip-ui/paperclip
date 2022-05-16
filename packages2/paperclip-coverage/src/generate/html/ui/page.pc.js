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

var $$Default = React.memo(
  React.forwardRef(function $$Default(props, ref) {
    return React.createElement(
      "html",
      {
        className: "_cee54446 _3ef4ccdc _pub-3ef4ccdc",
        ref: ref,
      },
      React.createElement(
        "head",
        {
          className: "_90b8db53 _3ef4ccdc _pub-3ef4ccdc",
        },
        props["head"]
      ),
      React.createElement(
        "body",
        {
          className: "_e7bfebc5 _3ef4ccdc _pub-3ef4ccdc",
        },
        props["children"]
      )
    );
  })
);
export default $$Default;
