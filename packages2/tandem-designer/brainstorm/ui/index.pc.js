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

var BoxModel = React.memo(
  React.forwardRef(function BoxModel(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_30b7e3b3 _3b07ee6b _pub-3b07ee6b" +
          " " +
          "_3b07ee6b_BoxModel _pub-3b07ee6b_BoxModel BoxModel",
        ref: ref,
      },
      null
    );
  })
);

var PaddingModel = React.memo(
  React.forwardRef(function PaddingModel(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_d9d44686 _3b07ee6b _pub-3b07ee6b" +
          " " +
          "_3b07ee6b_PaddingModel _pub-3b07ee6b_PaddingModel PaddingModel _3b07ee6b_BoxModel _pub-3b07ee6b_BoxModel BoxModel",
        ref: ref,
      },
      null
    );
  })
);

var MarginModel = React.memo(
  React.forwardRef(function MarginModel(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_37da27aa _3b07ee6b _pub-3b07ee6b" +
          " " +
          "_3b07ee6b_MarginModel _pub-3b07ee6b_MarginModel MarginModel _3b07ee6b_BoxModel _pub-3b07ee6b_BoxModel BoxModel",
        ref: ref,
      },
      null
    );
  })
);

var Field = React.memo(
  React.forwardRef(function Field(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_d0620aad _3b07ee6b _pub-3b07ee6b" +
          " " +
          "_3b07ee6b_Field _pub-3b07ee6b_Field Field" +
          (props["col1"]
            ? " " + "_3b07ee6b_col1 _pub-3b07ee6b_col1 col1"
            : "") +
          (props["col2"] ? " " + "_3b07ee6b_col2 _pub-3b07ee6b_col2 col2" : ""),
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_bc568364 _3b07ee6b _pub-3b07ee6b" +
            " " +
            "_3b07ee6b_label _pub-3b07ee6b_label label",
        },
        props["label"]
      ),
      React.createElement(
        "div",
        {
          className:
            "_cb51b3f2 _3b07ee6b _pub-3b07ee6b" +
            " " +
            "_3b07ee6b_input _pub-3b07ee6b_input input",
        },
        props["input"]
      )
    );
  })
);

var Dropdown = React.memo(
  React.forwardRef(function Dropdown(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_8daed937 _3b07ee6b _pub-3b07ee6b" +
          " " +
          "_3b07ee6b_Dropdown _pub-3b07ee6b_Dropdown Dropdown",
        ref: ref,
      },
      props["children"]
    );
  })
);

var LineHeightIcon = React.memo(
  React.forwardRef(function LineHeightIcon(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_63a0b81b _3b07ee6b _pub-3b07ee6b" +
          " " +
          "_3b07ee6b_LineHeightIcon _pub-3b07ee6b_LineHeightIcon LineHeightIcon",
        ref: ref,
      },
      null
    );
  })
);
