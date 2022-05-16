import React from "react";
import _pub1B5D7030 from "../../../../../../tandem-design-system/src/atoms.pc";
import _pub4Fa52E01, {
  Preview as _pub4Fa52E01_Preview,
} from "./Breadcrumbs/index.pc";
import _pubC7744A38, {
  Preview as _pubC7744A38_Preview,
} from "./Layers/index.pc";
import _pubAa109E70 from "../../../ResizableContainer/index.pc";
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
        className: "_d0dfb9c2 _9f0b6cab _pub-9f0b6cab _pub-1b5d7030",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Container };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      _pubAa109E70,
      {
        class: "_3ed1d8ee _9f0b6cab _pub-9f0b6cab _pub-1b5d7030",
        ref: ref,
        bottom: true,
        fixedSize: true,
      },
      React.createElement(
        Container,
        {
          class: "_fdfc2e9",
        },
        React.createElement(
          _pub4Fa52E01_Preview,
          {
            class: "_bdfc9c5a _9f0b6cab _pub-9f0b6cab _pub-1b5d7030",
          },
          null
        ),
        React.createElement(
          _pubC7744A38_Preview,
          {
            class: "_cafbaccc _9f0b6cab _pub-9f0b6cab _pub-1b5d7030",
          },
          null
        )
      )
    );
  })
);
export { Preview };
