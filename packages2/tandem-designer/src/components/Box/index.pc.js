import React from "react";
import _pub1B5D7030 from "../../../../tandem-design-system/src/atoms.pc";
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
        className:
          "_f90aa6bf _dbbcad92 _pub-dbbcad92" +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export default $$Default;

var test = React.memo(
  React.forwardRef(function test(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_1069038a _dbbcad92 _pub-dbbcad92",
        ref: ref,
        a: props["a"],
      },
      props["children"]
    );
  })
);
export { test };
