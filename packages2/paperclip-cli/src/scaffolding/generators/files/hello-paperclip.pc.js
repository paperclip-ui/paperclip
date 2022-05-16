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

var Message = React.memo(
  React.forwardRef(function Message(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_66352bad _999d9753 _pub-999d9753" +
          " " +
          "_999d9753_Message _pub-999d9753_Message Message",
        ref: ref,
      },
      props["children"],
      "!"
    );
  })
);
export { Message };
