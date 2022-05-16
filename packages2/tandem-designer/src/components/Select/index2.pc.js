import React from "react";
import _pubB2795D28 from "../../styles/atoms.pc";
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

var MenuItem = React.memo(
  React.forwardRef(function MenuItem(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_fd49ad0e _c2a10a92 _pub-c2a10a92" +
          (props["class"] ? " " + props["class"] : "") +
          (props["active"]
            ? " " + "_c2a10a92_active _pub-c2a10a92_active active"
            : "") +
          (props["hover"]
            ? " " + "_c2a10a92_hover _pub-c2a10a92_hover hover"
            : "") +
          (props["noFocus"]
            ? " " + "_c2a10a92_no-focus _pub-c2a10a92_no-focus no-focus"
            : ""),
        ref: ref,
        onMouseDown: props["onMouseDown"],
        onClick: props["onClick"],
        tabIndex: "-1",
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
        className:
          "_142a083b _c2a10a92 _pub-c2a10a92" +
          (props["round"]
            ? " " + "_c2a10a92_round _pub-c2a10a92_round round"
            : "") +
          " " +
          "_c2a10a92_v2 _pub-c2a10a92_v2 v2 " +
          (props["class"] ? " " + props["class"] : "") +
          (props["right"]
            ? " " + "_c2a10a92_right _pub-c2a10a92_right right"
            : ""),
        ref: ref,
        style: castStyle(props["style"]),
      },
      props["children"]
    );
  })
);
export { Menu };

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_fa246917 _c2a10a92 _pub-c2a10a92" +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
        tabIndex: "-1",
        onClick: props["onClick"],
        onBlur: props["onBlur"],
      },
      props["children"]
    );
  })
);
export { Container };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_1d9c4410 _c2a10a92 _pub-c2a10a92" +
          (props["right"]
            ? " " + "_c2a10a92_right _pub-c2a10a92_right right"
            : "") +
          (props["dark"]
            ? " " + "_c2a10a92_dark _pub-c2a10a92_dark dark"
            : "") +
          (props["light"]
            ? " " + "_c2a10a92_light _pub-c2a10a92_light light"
            : ""),
        ref: ref,
      },
      React.createElement(
        Container,
        {
          class: "_b5ec26e",
        },
        React.createElement(
          "button",
          {
            className: "_c93e9657 _c2a10a92 _pub-c2a10a92",
          },
          "I'm "
        ),
        props["showMenu"] &&
          React.createElement(
            Menu,
            {
              class: "_180614a1",
              dark: props["dark"],
              light: props["light"],
              right: props["right"],
            },
            React.createElement(
              MenuItem,
              {
                class: "_eaec396f",
              },
              "Search"
            ),
            React.createElement(
              MenuItem,
              {
                class: "_9deb09f9",
              },
              "Search"
            ),
            React.createElement(
              MenuItem,
              {
                class: "_4e25843",
              },
              "Search"
            ),
            React.createElement(
              MenuItem,
              {
                class: "_73e568d5",
              },
              "Search"
            ),
            React.createElement(
              MenuItem,
              {
                class: "_ed81fd76",
                active: true,
              },
              "Search"
            )
          )
      )
    );
  })
);
