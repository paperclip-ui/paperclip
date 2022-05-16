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
      "div",
      {
        className: "_67cd058c _4bf59013 _pub-4bf59013",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_d7710c2f _4bf59013 _pub-4bf59013",
        },
        props["children"]
      )
    );
  })
);
export default $$Default;

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      $$Default,
      {
        class: "_89c364a0",
        ref: ref,
      },
      React.createElement(
        "img",
        {
          className: "_a3f2e8d7 _4bf59013 _pub-4bf59013",
          src: "./logo-outline-5.png",
        },
        null
      )
    );
  })
);
export { Preview };
