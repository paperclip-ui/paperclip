import React from "react";
import _pub1B5D7030 from "../../../../tandem-design-system/src/atoms.pc";
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

var $$Default = React.memo(
  React.forwardRef(function $$Default(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_84b28ee6 _536876de _pub-536876de _pub-1b5d7030" +
          (props["flex"]
            ? " " + "_536876de_flex _pub-536876de_flex _pub-1b5d7030_flex flex"
            : "") +
          (props["scrollable"]
            ? " " +
              "_536876de_scrollable _pub-536876de_scrollable _pub-1b5d7030_scrollable scrollable"
            : "") +
          " " +
          "_536876de_font-regular _pub-536876de_font-regular _pub-1b5d7030_font-regular font-regular",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_320936d5 _536876de _pub-536876de _pub-1b5d7030",
        },
        props["title"]
      ),
      React.createElement(
        "div",
        {
          className: "_ab00676f _536876de _pub-536876de _pub-1b5d7030",
        },
        props["children"]
      )
    );
  })
);
export default $$Default;

var Section = React.memo(
  React.forwardRef(function Section(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_6dd12bd3 _536876de _pub-536876de _pub-1b5d7030" +
          " " +
          "_536876de_section _pub-536876de_section _pub-1b5d7030_section section",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Section };

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_83df4aff _536876de _pub-536876de _pub-1b5d7030" +
          " " +
          "_536876de_font-regular _pub-536876de_font-regular _pub-1b5d7030_font-regular font-regular",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Container };
