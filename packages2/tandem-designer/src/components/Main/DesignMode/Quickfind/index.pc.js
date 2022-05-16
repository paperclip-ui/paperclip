import React from "react";
import _pub1B5D7030 from "../../../../../../tandem-design-system/src/atoms.pc";
import _pubB4A1Dc67 from "../../../../../../tandem-design-system/src/TextInput.pc";
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

var Item = React.memo(
  React.forwardRef(function Item(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_a2a65e84 _b7c93a9 _pub-b7c93a9 _pub-1b5d7030" +
          (props["active"]
            ? " " +
              "_b7c93a9_active _pub-b7c93a9_active _pub-1b5d7030_active active"
            : "") +
          (props["isText"]
            ? " " + "_b7c93a9_text _pub-b7c93a9_text _pub-1b5d7030_text text"
            : "") +
          (props["isComponent"]
            ? " " +
              "_b7c93a9_component _pub-b7c93a9_component _pub-1b5d7030_component component"
            : "") +
          (props["isElement"]
            ? " " +
              "_b7c93a9_element _pub-b7c93a9_element _pub-1b5d7030_element element"
            : "") +
          (props["hover"]
            ? " " +
              "_b7c93a9_hover _pub-b7c93a9_hover _pub-1b5d7030_hover hover"
            : ""),
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_e311cb30 _b7c93a9 _pub-b7c93a9 _pub-1b5d7030",
        },
        React.createElement(
          "div",
          {
            className: "_e3dd86f0 _b7c93a9 _pub-b7c93a9 _pub-1b5d7030",
          },
          null
        )
      ),
      React.createElement(
        "div",
        {
          className: "_7a189a8a _b7c93a9 _pub-b7c93a9 _pub-1b5d7030",
        },
        React.createElement(
          "div",
          {
            className: "_e19b38a9 _b7c93a9 _pub-b7c93a9 _pub-1b5d7030",
          },
          props["title"]
        ),
        React.createElement(
          "div",
          {
            className: "_78926913 _b7c93a9 _pub-b7c93a9 _pub-1b5d7030",
          },
          props["description"]
        )
      )
    );
  })
);
export { Item };

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_4bc5fbb1 _b7c93a9 _pub-b7c93a9 _pub-1b5d7030",
        ref: ref,
      },
      props["filterInput"],
      React.createElement(
        "div",
        {
          className: "_7e95e638 _b7c93a9 _pub-b7c93a9 _pub-1b5d7030",
        },
        React.createElement(
          "div",
          {
            className: "_6edbcd09 _b7c93a9 _pub-b7c93a9 _pub-1b5d7030",
          },
          props["items"]
        )
      )
    );
  })
);
export { Container };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      Container,
      {
        class: "_a5cb9a9d",
        ref: ref,
        filterInput: React.createElement(
          _pubB4A1Dc67,
          {
            class: "_e3c9aaf8 _b7c93a9 _pub-b7c93a9 _pub-1b5d7030",
            secondary: true,
            big: true,
            wide: true,
            placeholder: "Filter...",
          },
          null
        ),
        items: React.createElement(
          React.Fragment,
          {},
          React.createElement(
            Item,
            {
              class: "_a803acb3",
              active: true,
              isText: true,
              title: "Text",
              description: "A native HTML text node",
            },
            null
          ),
          React.createElement(
            Item,
            {
              class: "_df049c25",
              hover: true,
              isElement: true,
              title: "div",
              description:
                "defines a division or a section in an HTML document",
            },
            null
          ),
          React.createElement(
            Item,
            {
              class: "_460dcd9f",
              isElement: true,
              title: "span",
              description:
                "an inline container used to mark up a part of a text, or a part of a document",
            },
            null
          ),
          React.createElement(
            Item,
            {
              class: "_310afd09",
              isElement: true,
              title: "form",
              description:
                "a document section containing interactive controls for submitting information. Some super long text that should be truncated",
            },
            null
          ),
          React.createElement(
            Item,
            {
              class: "_af6e68aa",
              isComponent: true,
              title: "Select",
              description: "Some custom description of my component",
            },
            null
          ),
          React.createElement(
            Item,
            {
              class: "_d869583c",
              isComponent: true,
              title: "Button",
            },
            null
          )
        ),
      },
      null
    );
  })
);
export { Preview };
