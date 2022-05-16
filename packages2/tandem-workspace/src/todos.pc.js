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

var List = React.memo(
  React.forwardRef(function List(props, ref) {
    return React.createElement(
      "ul",
      {
        className: "_b9fbc623 _52bb7618 _pub-52bb7618",
        ref: ref,
      },
      props["children"]
    );
  })
);

var ListItem = React.memo(
  React.forwardRef(function ListItem(props, ref) {
    return React.createElement(
      "li",
      {
        className: "_57f5a70f _52bb7618 _pub-52bb7618",
        ref: ref,
      },
      props["children"]
    );
  })
);
