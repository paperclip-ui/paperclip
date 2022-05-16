import React from "react";
import _pubCc252Ee9 from "../Select/index.pc";
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
          "_fc4022a6 _76cd34bb _pub-76cd34bb" +
          " " +
          "_76cd34bb_field _pub-76cd34bb_field field" +
          (props["col1"]
            ? " " +
              "_76cd34bb_field--col1 _pub-76cd34bb_field--col1 field--col1"
            : "") +
          (props["inline"]
            ? " " +
              "_76cd34bb_field--inline _pub-76cd34bb_field--inline field--inline"
            : "") +
          (props["noLabel"]
            ? " " +
              "_76cd34bb_field--noLabel _pub-76cd34bb_field--noLabel field--noLabel"
            : ""),
        ref: ref,
      },
      React.createElement(
        "label",
        {
          className: "_6a17de77 _76cd34bb _pub-76cd34bb",
        },
        props["label"]
      ),
      React.createElement(
        "div",
        {
          className:
            "_1d10eee1 _76cd34bb _pub-76cd34bb" +
            " " +
            "_76cd34bb_input _pub-76cd34bb_input input",
        },
        props["children"]
      )
    );
  })
);
export default $$Default;
