import React from "react";
import _pub1B5D7030 from "../../../../tandem-design-system/src/atoms.pc";
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
          "_9e992542 _cc252ee9 _pub-cc252ee9 _pub-1b5d7030" +
          " " +
          "_cc252ee9_button-base _pub-cc252ee9_button-base _pub-1b5d7030_button-base button-base " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
        onClick: props["onClick"],
      },
      React.createElement(
        "span",
        {
          className:
            "_b9662f73 _cc252ee9 _pub-cc252ee9 _pub-1b5d7030" +
            " " +
            "_cc252ee9_label _pub-cc252ee9_label _pub-1b5d7030_label label",
        },
        props["placeholder"]
      ),
      React.createElement(
        "i",
        {
          className: "_206f7ec9 _cc252ee9 _pub-cc252ee9 _pub-1b5d7030",
        },
        null
      )
    );
  })
);
export default $$Default;

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_77fa8077 _cc252ee9 _pub-cc252ee9 _pub-1b5d7030" +
          " " +
          "_cc252ee9_font-default _pub-cc252ee9_font-default _pub-1b5d7030_font-default font-default " +
          (props["class"] ? " " + props["class"] : "") +
          (props["open"]
            ? " " + "_cc252ee9_open _pub-cc252ee9_open _pub-1b5d7030_open open"
            : "") +
          (props["disabled"]
            ? " " +
              "_cc252ee9_disabled _pub-cc252ee9_disabled _pub-1b5d7030_disabled disabled"
            : ""),
        ref: ref,
        onClick: props["onClick"],
        onBlur: props["onBlur"],
        ref: props["ref"],
      },
      props["children"]
    );
  })
);
export { Container };

var MenuItem = React.memo(
  React.forwardRef(function MenuItem(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_99f4e15b _cc252ee9 _pub-cc252ee9 _pub-1b5d7030" +
          (props["hover"]
            ? " " +
              "_cc252ee9_hover _pub-cc252ee9_hover _pub-1b5d7030_hover hover"
            : "") +
          (props["active"]
            ? " " +
              "_cc252ee9_active _pub-cc252ee9_active _pub-1b5d7030_active active"
            : ""),
        ref: ref,
        onClick: props["onClick"],
      },
      props["children"]
    );
  })
);
export { MenuItem };

var Menu = React.memo(
  React.forwardRef(function Menu(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_7e4ccc5c _cc252ee9 _pub-cc252ee9 _pub-1b5d7030",
        ref: ref,
        style: castStyle(props["style"]),
      },
      props["children"]
    );
  })
);
export { Menu };
