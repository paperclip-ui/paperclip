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
        className: "_bac7e521 _6c80b517 _pub-6c80b517",
        ref: ref,
      },
      React.createElement(
        "head",
        {
          className: "_1bd5c16f _6c80b517 _pub-6c80b517",
        },
        props["head"]
      ),
      React.createElement(
        "body",
        {
          className: "_6cd2f1f9 _6c80b517 _pub-6c80b517",
        },
        props["children"]
      )
    );
  })
);
export default $$Default;
