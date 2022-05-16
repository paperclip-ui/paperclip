import React from "react";
import _pubC1C00C27, {
  Preview as _pubC1C00C27_Preview,
} from "./Tools/Frames/index.pc";
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

var Canvas = React.memo(
  React.forwardRef(function Canvas(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_56cd1056 _9a1d806 _pub-9a1d806" +
          " " +
          "_9a1d806_canvas _pub-9a1d806_canvas canvas",
        ref: ref,
        style: castStyle(props["style"]),
        onMouseMove: props["onMouseMove"],
        onScroll: props["onScroll"],
        onWheelCapture: props["onWheelCapture"],
        "data-label": "Canvas",
      },
      props["children"]
    );
  })
);
export { Canvas };

var Inner = React.memo(
  React.forwardRef(function Inner(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_bfaeb563 _9a1d806 _pub-9a1d806" +
          " " +
          "_9a1d806_inner _pub-9a1d806_inner inner " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
        style: castStyle(props["style"]),
      },
      props["children"]
    );
  })
);
export { Inner };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      Canvas,
      {
        class: "_c11fc9de",
        ref: ref,
      },
      React.createElement(
        _pubC1C00C27_Preview,
        {
          class: "_ba292b26 _9a1d806 _pub-9a1d806",
        },
        null
      )
    );
  })
);
export { Preview };
