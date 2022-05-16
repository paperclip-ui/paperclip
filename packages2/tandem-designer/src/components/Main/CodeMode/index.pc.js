import React from "react";
import _pub1B5D7030 from "../../../../../tandem-design-system/src/atoms.pc";
import _pub4Dc2923D, {
  Preview as _pub4Dc2923D_Preview,
} from "./Toolbar/index.pc";
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
          "_2d794492 _8e7608ce _pub-8e7608ce _pub-1b5d7030" +
          " " +
          "_8e7608ce_v2 _pub-8e7608ce_v2 _pub-1b5d7030_v2 v2 _8e7608ce_dark _pub-8e7608ce_dark _pub-1b5d7030_dark dark _8e7608ce_font-default _pub-8e7608ce_font-default _pub-1b5d7030_font-default font-default",
        ref: ref,
      },
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
        className:
          "_c41ae1a7 _8e7608ce _pub-8e7608ce _pub-1b5d7030" +
          (props["slim"]
            ? " " + "_8e7608ce_slim _pub-8e7608ce_slim _pub-1b5d7030_slim slim"
            : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Content };

var CantEditScreen = React.memo(
  React.forwardRef(function CantEditScreen(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_2a14808b _8e7608ce _pub-8e7608ce _pub-1b5d7030" +
          " " +
          "_8e7608ce_v2 _pub-8e7608ce_v2 _pub-1b5d7030_v2 v2 _8e7608ce_dark _pub-8e7608ce_dark _pub-1b5d7030_dark dark",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_5e2a09e _8e7608ce _pub-8e7608ce _pub-1b5d7030",
        },
        "\n    Unable to edit this file\n  "
      )
    );
  })
);
export { CantEditScreen };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      Container,
      {
        class: "_cdacad8c",
        ref: ref,
        slim: props["slim"],
        float: props["float"],
      },
      props["showSlimNav"] &&
        React.createElement(
          _pub4Dc2923D_Preview,
          {
            class: "_1aadc5b0 _8e7608ce _pub-8e7608ce _pub-1b5d7030",
            showFileMenu: props["showFileMenu"],
          },
          null
        ),
      !props["cantEdit"] &&
        React.createElement(
          Content,
          {
            class: "_3b6f4f1",
          },
          null
        ),
      props["cantEdit"] &&
        React.createElement(
          CantEditScreen,
          {
            class: "_289ba732",
          },
          null
        )
    );
  })
);
export { Preview };
