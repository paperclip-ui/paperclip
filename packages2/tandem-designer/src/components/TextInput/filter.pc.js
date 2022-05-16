import React from "react";
import _pubA1B1A854 from "../../styles/utils.pc";
import _pubB4A1Dc67 from "../../../../tandem-design-system/src/TextInput.pc";
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

var FilterTextInput = React.memo(
  React.forwardRef(function FilterTextInput(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_71848644 _b4f56def _pub-b4f56def" +
          " " +
          "_b4f56def_v2 _pub-b4f56def_v2 v2 " +
          (props["class"] ? " " + props["class"] : "") +
          (props["dark"] ? " " + "_b4f56def_dark _pub-b4f56def_dark dark" : ""),
        ref: ref,
      },
      React.createElement(
        "i",
        {
          className: "_a0e395ba _b4f56def _pub-b4f56def",
        },
        null
      ),
      React.createElement(
        _pubB4A1Dc67,
        {
          class: "_39eac400 _b4f56def _pub-b4f56def",
          placeholder: "Filter",
          ref: props["filterInputRef"],
          defaultValue: props["defaultValue"],
          onKeyPress: props["onKeyPress"],
          onChange: props["onChange"],
          autoFocus: props["autoFocus"],
        },
        null
      )
    );
  })
);
export { FilterTextInput };
