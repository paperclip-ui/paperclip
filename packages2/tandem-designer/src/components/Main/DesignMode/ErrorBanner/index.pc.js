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

var ErrorBanner = React.memo(
  React.forwardRef(function ErrorBanner(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_3cae0d58 _b3ef74ec _pub-b3ef74ec" +
          " " +
          "_b3ef74ec_error-banner _pub-b3ef74ec_error-banner error-banner",
        ref: ref,
        onClick: props["onClick"],
      },
      React.createElement(
        "div",
        {
          className: "_3cfedf65 _b3ef74ec _pub-b3ef74ec",
        },
        "\n    Error in ",
        props["filePath"]
      ),
      React.createElement(
        "div",
        {
          className: "_a5f78edf _b3ef74ec _pub-b3ef74ec",
        },
        props["message"]
      )
    );
  })
);
export { ErrorBanner };
