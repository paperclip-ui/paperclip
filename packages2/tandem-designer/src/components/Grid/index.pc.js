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

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_660caff2 _276397ed _pub-276397ed" +
          " " +
          "_276397ed_grid _pub-276397ed_grid grid",
        ref: ref,
        style: castStyle("--columns: " + props["columns"] + ";"),
      },
      props["children"]
    );
  })
);
export { Container };

var Item = React.memo(
  React.forwardRef(function Item(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_8f6f0ac7 _276397ed _pub-276397ed" +
          " " +
          "_276397ed_item _pub-276397ed_item item",
        ref: ref,
        style: castStyle("--span: " + props["span"] + ";"),
      },
      props["children"]
    );
  })
);
export { Item };
