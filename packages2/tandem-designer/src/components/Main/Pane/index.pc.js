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

var Header = React.memo(
  React.forwardRef(function Header(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_94d3b400 _aeb2d2f0 _pub-aeb2d2f0" +
          " " +
          "_aeb2d2f0_header _pub-aeb2d2f0_header header",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Header };

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_7addd52c _aeb2d2f0 _pub-aeb2d2f0" +
          " " +
          "_aeb2d2f0_container _pub-aeb2d2f0_container container",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Container };
