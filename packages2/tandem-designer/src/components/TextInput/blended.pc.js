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

var DummySpan = React.memo(
  React.forwardRef(function DummySpan(props, ref) {
    return React.createElement(
      "span",
      {
        className:
          "_e359a9b6 _43dd8a33 _pub-43dd8a33" +
          " " +
          "_43dd8a33_font-default _pub-43dd8a33_font-default font-default",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { DummySpan };

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "span",
      {
        className:
          "_d57c89a _43dd8a33 _pub-43dd8a33" +
          (props["autoResize"]
            ? " " +
              "_43dd8a33_auto-resize _pub-43dd8a33_auto-resize auto-resize"
            : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Container };
