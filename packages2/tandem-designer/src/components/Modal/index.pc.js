import React from "react";
import _pub1B5D7030 from "../../../../tandem-design-system/src/atoms.pc";
import _pub2F64F7Ba from "../../../../tandem-design-system/src/Button.pc";
import _pubDbbcad92 from "../Box/index.pc";
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

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_b13e6759 _daf69117 _pub-daf69117 _pub-1b5d7030" +
          " " +
          "_daf69117_font-regular _pub-daf69117_font-regular _pub-1b5d7030_font-regular font-regular",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_8882ebf2 _daf69117 _pub-daf69117 _pub-1b5d7030",
          onClick: props["onBackgroundClick"],
        },
        null
      ),
      props["children"]
    );
  })
);
export { Container };

var Content = React.memo(
  React.forwardRef(function Content(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_c63957cf _daf69117 _pub-daf69117 _pub-1b5d7030",
        ref: ref,
      },
      props["title"] &&
        React.createElement(
          "h3",
          {
            className: "_1f5ca99f _daf69117 _pub-daf69117 _pub-1b5d7030",
          },
          props["title"]
        ),
      React.createElement(
        "div",
        {
          className: "_1049d07f _daf69117 _pub-daf69117 _pub-1b5d7030",
        },
        props["children"]
      ),
      React.createElement(
        "div",
        {
          className: "_674ee0e9 _daf69117 _pub-daf69117 _pub-1b5d7030",
        },
        props["footer"]
      )
    );
  })
);
export { Content };
