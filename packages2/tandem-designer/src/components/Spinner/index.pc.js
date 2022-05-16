import React from "react";
import _pubA1B1A854 from "../../styles/utils.pc";
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
          "_2de355cf _cfabf990 _pub-cfabf990" +
          (props["class"] ? " " + props["class"] : "") +
          (props["immediate"]
            ? " " + "_cfabf990_immediate _pub-cfabf990_immediate immediate"
            : ""),
        ref: ref,
      },
      null
    );
  })
);
export default $$Default;

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_c480f0fa _cfabf990 _pub-cfabf990" +
          (props["dark"]
            ? " " + "_cfabf990_dark _pub-cfabf990_dark dark"
            : "") +
          (props["light"]
            ? " " + "_cfabf990_light _pub-cfabf990_light light"
            : ""),
        ref: ref,
      },
      React.createElement(
        $$Default,
        {
          class: "_63c37781",
          speed: "2s",
        },
        null
      )
    );
  })
);
export { Preview };
