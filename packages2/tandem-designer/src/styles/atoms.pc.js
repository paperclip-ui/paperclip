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
  "button-base": "_pub-b2795d28_button-base",
  "button-reset": "_pub-b2795d28_button-reset",
  code: "_pub-b2795d28_code",
  flex: "_pub-b2795d28_flex",
  "font-default": "_pub-b2795d28_font-default",
  "font-regular": "_pub-b2795d28_font-regular",
};

var Color = React.memo(
  React.forwardRef(function Color(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_38e7af12 _b2795d28 _pub-b2795d28",
        ref: ref,
        style: castStyle("--value: " + props["value"]),
      },
      null
    );
  })
);

var Section = React.memo(
  React.forwardRef(function Section(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_d1840a27 _b2795d28 _pub-b2795d28",
        ref: ref,
      },
      React.createElement(
        "h4",
        {
          className: "_7d3af243 _b2795d28 _pub-b2795d28",
        },
        props["title"]
      ),
      React.createElement(
        "div",
        {
          className: "_a3dc2d5 _b2795d28 _pub-b2795d28",
        },
        props["children"]
      )
    );
  })
);

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_488d5b9d _b2795d28 _pub-b2795d28" +
          (props["padded"]
            ? " " + "_b2795d28_padded _pub-b2795d28_padded padded"
            : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Preview };
