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

var ButtonGroup = React.memo(
  React.forwardRef(function ButtonGroup(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_e29c198d _d575c444 _pub-d575c444" +
          " " +
          "_d575c444_button-group _pub-d575c444_button-group button-group",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { ButtonGroup };

var Button = React.memo(
  React.forwardRef(function Button(props, ref) {
    return React.createElement(
      "button",
      {
        className:
          "_bffbcb8 _d575c444 _pub-d575c444" +
          " " +
          "_d575c444_button _pub-d575c444_button button" +
          (props["selected"]
            ? " " +
              "_d575c444_button--selected _pub-d575c444_button--selected button--selected"
            : "") +
          (props["hover"]
            ? " " +
              "_d575c444_button--hover _pub-d575c444_button--hover button--hover"
            : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Button };
