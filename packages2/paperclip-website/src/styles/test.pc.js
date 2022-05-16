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

var Checkbox = React.memo(
  React.forwardRef(function Checkbox(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_5495da13 _cbe9cc55 _pub-cbe9cc55" +
          " " +
          "_cbe9cc55_checkbox _pub-cbe9cc55_checkbox checkbox",
        ref: ref,
      },
      React.createElement(
        "input",
        {
          className: "_40c35671 _cbe9cc55 _pub-cbe9cc55",
          type: "checkbox",
          checked: props["checked"],
        },
        null
      ),
      React.createElement(
        "div",
        {
          className:
            "_37c466e7 _cbe9cc55 _pub-cbe9cc55" +
            " " +
            "_cbe9cc55_dummy _pub-cbe9cc55_dummy dummy",
        },
        null
      )
    );
  })
);

var TodoItem = React.memo(
  React.forwardRef(function TodoItem(props, ref) {
    return React.createElement(
      "li",
      {
        className:
          "_bdf67f26 _cbe9cc55 _pub-cbe9cc55" +
          (props["alt"] ? " " + "_cbe9cc55_alt _pub-cbe9cc55_alt alt" : ""),
        ref: ref,
      },
      React.createElement(
        Checkbox,
        {
          class: "_33491a55",
          checked: props["checked"],
        },
        null
      ),
      props["children"]
    );
  })
);
export { TodoItem };

var App = React.memo(
  React.forwardRef(function App(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_53f81e0a _cbe9cc55 _pub-cbe9cc55" +
          " " +
          "_cbe9cc55_app _pub-cbe9cc55_app app",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_47cafead _cbe9cc55 _pub-cbe9cc55" +
            " " +
            "_cbe9cc55_header _pub-cbe9cc55_header header",
        },
        React.createElement(
          "h1",
          {
            className: "_68622c9 _cbe9cc55 _pub-cbe9cc55",
          },
          props["title"]
        ),
        React.createElement(
          "form",
          {
            className: "_7181125f _cbe9cc55 _pub-cbe9cc55",
            onSubmit: props["onSubmit"],
          },
          React.createElement(
            "input",
            {
              className: "_89b039ee _cbe9cc55 _pub-cbe9cc55",
              placeholder: "new todo",
            },
            null
          ),
          React.createElement(
            "button",
            {
              className: "_feb70978 _cbe9cc55 _pub-cbe9cc55",
            },
            "Add todo"
          )
        )
      ),
      React.createElement(
        "ul",
        {
          className:
            "_30cdce3b _cbe9cc55 _pub-cbe9cc55" +
            " " +
            "_cbe9cc55_todo-items _pub-cbe9cc55_todo-items todo-items",
        },
        props["todos"]
      )
    );
  })
);
export { App };
