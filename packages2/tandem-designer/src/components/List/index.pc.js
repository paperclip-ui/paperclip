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
      "ul",
      {
        className:
          "_42852a66 _d6d77c1b _pub-d6d77c1b" +
          " " +
          "_d6d77c1b_list _pub-d6d77c1b_list list",
        ref: ref,
      },
      props["children"]
    );
  })
);
export default $$Default;

var Item = React.memo(
  React.forwardRef(function Item(props, ref) {
    return React.createElement(
      "li",
      {
        className:
          "_abe68f53 _d6d77c1b _pub-d6d77c1b" +
          " " +
          "_d6d77c1b_item _pub-d6d77c1b_item item" +
          (props["alt"]
            ? " " + "_d6d77c1b_item--alt _pub-d6d77c1b_item--alt item--alt"
            : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Item };
