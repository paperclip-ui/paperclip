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

var Sample = React.memo(
  React.forwardRef(function Sample(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_81dfc6af _c4699182 _pub-c4699182" +
          " " +
          "_c4699182_font _pub-c4699182_font font " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      "\n  A quick brown fox jumped over the lazy dog\n"
    );
  })
);

var $$Default = React.memo(
  React.forwardRef(function $$Default(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_68bc639a _c4699182 _pub-c4699182",
        ref: ref,
        style: castStyle("font-family: " + props["fontFamily"]),
      },
      React.createElement(
        Sample,
        {
          class: "_183f4272" + " " + "extra-light",
        },
        null
      ),
      React.createElement(
        Sample,
        {
          class: "_6f3872e4" + " " + "light",
        },
        null
      ),
      React.createElement(
        Sample,
        {
          class: "_f631235e",
        },
        null
      ),
      React.createElement(
        Sample,
        {
          class: "_813613c8" + " " + "medium",
        },
        null
      ),
      React.createElement(
        Sample,
        {
          class: "_1f52866b" + " " + "bold",
        },
        null
      ),
      React.createElement(
        Sample,
        {
          class: "_6855b6fd" + " " + "extra-bold",
        },
        null
      )
    );
  })
);
export default $$Default;
