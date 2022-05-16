import React from "react";
import _pubDcc36159, {
  Preview as _pubDcc36159_Preview,
} from "./DesignMode/index.pc";
import _pubB4Ea63C, {
  Preview as _pubB4Ea63C_Preview,
} from "./LeftSidebar/index.pc";
import _pub8E7608Ce, {
  Preview as _pub8E7608Ce_Preview,
} from "./CodeMode/index.pc";
import _pubB7C93A9 from "./DesignMode/Quickfind/index.pc";
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
          "_a68e503b _71985e0e _pub-71985e0e" +
          " " +
          "_71985e0e_editor _pub-71985e0e_editor editor " +
          (props["class"] ? " " + props["class"] : "") +
          (props["rounded"]
            ? " " + "_71985e0e_rounded _pub-71985e0e_rounded rounded"
            : "") +
          (props["floatingPreview"]
            ? " " +
              "_71985e0e_floating-preview _pub-71985e0e_floating-preview floating-preview"
            : "") +
          (props["showLeftSidebar"]
            ? " " +
              "_71985e0e_show-left-sidebar _pub-71985e0e_show-left-sidebar show-left-sidebar"
            : ""),
        ref: ref,
        style: castStyle(props["style"]),
      },
      props["children"]
    );
  })
);
export { Container };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      Container,
      {
        class: "_41367d3c" + (props["fullSize"] ? " " + "full-size" : ""),
        ref: ref,
        rounded: props["rounded"],
        floatingPreview: props["floatingPreview"],
        showLeftSidebar: props["showLeftSidebar"],
      },
      props["showLeftSidebar"] &&
        React.createElement(
          _pubB4Ea63C_Preview,
          {
            class: "_570ab528 _71985e0e _pub-71985e0e",
          },
          null
        ),
      props["codeMode"] &&
        React.createElement(
          _pub8E7608Ce_Preview,
          {
            class: "_7c27e6eb _71985e0e _pub-71985e0e",
            float: props["float"],
            showSlimNav: props["showSlimNav"],
            showFileMenu: props["showFileMenu"],
          },
          null
        ),
      props["designer"] &&
        React.createElement(
          _pubDcc36159_Preview,
          {
            class: "_653cd7aa _71985e0e _pub-71985e0e",
            float: props["float"],
            v2: true,
            showLeftSidebar: props["showLeftSidebar"],
            showQuickfind: props["showQuickfind"],
            dark: props["dark"],
            showEnvPopup: props["showEnvPopup"],
            showGrid: props["showGrid"],
            showCanvas: props["showCanvas"],
          },
          null
        )
    );
  })
);
export { Preview };
