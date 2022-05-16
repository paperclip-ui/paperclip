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

export const classNames = {
  icon: "_pub-a04b5582_icon",
  "icon--dots": "_pub-a04b5582_icon--dots",
  "icon--plus": "_pub-a04b5582_icon--plus",
};

var Icon = React.memo(
  React.forwardRef(function Icon(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_90277398 _a04b5582 _pub-a04b5582" +
          " " +
          "_a04b5582_icon _pub-a04b5582_icon icon " +
          (props["class"] ? " " + props["class"] : "") +
          (props["dots"]
            ? " " + "_a04b5582_icon--dots _pub-a04b5582_icon--dots icon--dots"
            : "") +
          (props["plus"]
            ? " " + "_a04b5582_icon--plus _pub-a04b5582_icon--plus icon--plus"
            : ""),
        ref: ref,
      },
      null
    );
  })
);
export { Icon };
