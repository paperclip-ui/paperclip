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
      props.tagName || "div",
      {
        className:
          "_1224af51 _80ae89f7 _pub-80ae89f7" +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
        style: castStyle(props["style"]),
        onScroll: props["onScroll"],
      },
      React.createElement(
        "div",
        {
          className: "_d5e48862 _80ae89f7 _pub-80ae89f7",
          style: castStyle(props["contentStyle"]),
        },
        props["children"]
      ),
      React.createElement(
        Resizer,
        {
          class: "_4cedd9d8",
          style: castStyle(props["resizerStyle"]),
        },
        null
      )
    );
  })
);
export { Container };

var Resizer = React.memo(
  React.forwardRef(function Resizer(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_fc2ace7d _80ae89f7 _pub-80ae89f7",
        ref: ref,
        style: castStyle(props["style"]),
      },
      null
    );
  })
);
