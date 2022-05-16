import React from "react";
import _pubB8Cd5Eb2 from "./test3.pc";
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

var Test = React.memo(
  React.forwardRef(function Test(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_aa41d2aa _7139d7 _pub-7139d7",
        ref: ref,
      },
      props["children"]
    );
  })
);

var Testttt = React.memo(
  React.forwardRef(function Testttt(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_444fb386 _7139d7 _pub-7139d7",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_789be108 _7139d7 _pub-7139d7",
        },
        props["child"]
      )
    );
  })
);
