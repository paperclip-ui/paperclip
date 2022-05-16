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

var Thumbnail = React.memo(
  React.forwardRef(function Thumbnail(props, ref) {
    return React.createElement(
      "a",
      {
        className:
          "_48d5277e _a748f8aa _pub-a748f8aa" +
          (props["class"] ? " " + props["class"] : "") +
          (props["active"]
            ? " " + "_a748f8aa_active _pub-a748f8aa_active active"
            : "") +
          (props["hasChanges"]
            ? " " +
              "_a748f8aa_has-changes _pub-a748f8aa_has-changes has-changes"
            : "") +
          (props["noChanges"]
            ? " " + "_a748f8aa_no-changes _pub-a748f8aa_no-changes no-changes"
            : ""),
        ref: ref,
        id: props["id"],
        href: props["href"],
        style: castStyle("--background: url(" + props["src"] + ");"),
      },
      React.createElement(
        "div",
        {
          className: "_249be1ec _a748f8aa _pub-a748f8aa",
        },
        React.createElement(
          "span",
          {
            className: "_15eb02bf _a748f8aa _pub-a748f8aa",
          },
          props["title"] || "Untitled"
        )
      ),
      React.createElement(
        "div",
        {
          className:
            "_bd92b056 _a748f8aa _pub-a748f8aa" +
            " " +
            "_a748f8aa_img-container _pub-a748f8aa_img-container img-container " +
            (props["bgClassName"] ? " " + props["bgClassName"] : ""),
        },
        null
      )
    );
  })
);
export { Thumbnail };

var Comparison = React.memo(
  React.forwardRef(function Comparison(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_a1b6824b _a748f8aa _pub-a748f8aa",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Comparison };

var Screenshot = React.memo(
  React.forwardRef(function Screenshot(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_4fb8e367 _a748f8aa _pub-a748f8aa" +
          (props["a"] ? " " + "_a748f8aa_a _pub-a748f8aa_a a" : "") +
          (props["b"] ? " " + "_a748f8aa_b _pub-a748f8aa_b b" : "") +
          (props["c"] ? " " + "_a748f8aa_c _pub-a748f8aa_c c" : ""),
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_23924930 _a748f8aa _pub-a748f8aa",
        },
        props["title"]
      ),
      React.createElement(
        "div",
        {
          className: "_ba9b188a _a748f8aa _pub-a748f8aa",
        },
        props["children"]
      )
    );
  })
);
export { Screenshot };

var Report = React.memo(
  React.forwardRef(function Report(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_a800ce60 _a748f8aa _pub-a748f8aa",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_290c643a _a748f8aa _pub-a748f8aa",
        },
        props["sidebar"]
      ),
      React.createElement(
        "div",
        {
          className: "_b0053580 _a748f8aa _pub-a748f8aa",
        },
        React.createElement(
          "div",
          {
            className: "_5d1da447 _a748f8aa _pub-a748f8aa",
          },
          React.createElement(
            "h1",
            {
              className: "_5eaeab04 _a748f8aa _pub-a748f8aa",
            },
            props["title"]
          ),
          React.createElement(
            "span",
            {
              className: "_c7a7fabe _a748f8aa _pub-a748f8aa",
            },
            props["subtitle"]
          )
        ),
        props["content"]
      ),
      React.createElement(
        "div",
        {
          className: "_c7020516 _a748f8aa _pub-a748f8aa",
        },
        null
      )
    );
  })
);
export { Report };

var Divider = React.memo(
  React.forwardRef(function Divider(props, ref) {
    return React.createElement(
      "hr",
      {
        className: "_680305fe _a748f8aa _pub-a748f8aa",
        ref: ref,
      },
      null
    );
  })
);
export { Divider };
