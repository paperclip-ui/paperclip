import React from "react";
import _pub5F9F7863 from "./roboto/index.pc";
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

var Gutter = React.memo(
  React.forwardRef(function Gutter(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_866b8cbe _2f84b91e _pub-2f84b91e" +
          (props["left"]
            ? " " +
              "_2f84b91e_tall _pub-2f84b91e_tall tall _2f84b91e_left _pub-2f84b91e_left left"
            : "") +
          (props["right"]
            ? " " +
              "_2f84b91e_tall _pub-2f84b91e_tall tall _2f84b91e_right _pub-2f84b91e_right right"
            : "") +
          (props["bottom"]
            ? " " +
              "_2f84b91e_flat _pub-2f84b91e_flat flat _2f84b91e_bottom _pub-2f84b91e_bottom bottom"
            : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Gutter };

var TreeBranch = React.memo(
  React.forwardRef(function TreeBranch(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_6865ed92 _2f84b91e _pub-2f84b91e" +
          (props["active"]
            ? " " + "_2f84b91e_active _pub-2f84b91e_active active"
            : ""),
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_ade15612 _2f84b91e _pub-2f84b91e" +
            (props["active"]
              ? " " + "_2f84b91e_active _pub-2f84b91e_active active"
              : ""),
        },
        props["leaf"]
      ),
      props["children"]
    );
  })
);

var Leaf = React.memo(
  React.forwardRef(function Leaf(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_8fddc095 _2f84b91e _pub-2f84b91e" +
          " " +
          "_2f84b91e_font-small _pub-2f84b91e_font-small font-small " +
          (props["class"] ? " " + props["class"] : "") +
          (props["expanded"]
            ? " " + "_2f84b91e_expanded _pub-2f84b91e_expanded expanded"
            : "") +
          (props["hasChildren"]
            ? " " +
              "_2f84b91e_has-children _pub-2f84b91e_has-children has-children"
            : ""),
        ref: ref,
        style: castStyle("--depth: " + props["depth"]),
      },
      React.createElement(
        Icon,
        {
          class: "_a77f7b18",
        },
        null
      ),
      props["children"],
      React.createElement(
        "div",
        {
          className: "_49711a34 _2f84b91e _pub-2f84b91e",
        },
        props["controls"]
      )
    );
  })
);

var LayerLeaf = React.memo(
  React.forwardRef(function LayerLeaf(props, ref) {
    return React.createElement(
      Leaf,
      {
        class:
          "_a5f3de63" +
          (props["isElement"]
            ? " " + "_2f84b91e_is-element _pub-2f84b91e_is-element is-element"
            : "") +
          (props["isComponent"]
            ? " " +
              "_2f84b91e_is-component _pub-2f84b91e_is-component is-component"
            : "") +
          (props["isInstance"]
            ? " " +
              "_2f84b91e_is-instance _pub-2f84b91e_is-instance is-instance"
            : "") +
          (props["inInstance"]
            ? " " +
              "_2f84b91e_in-instance _pub-2f84b91e_in-instance in-instance"
            : ""),
        ref: ref,
        expanded: props["expanded"],
        hasChildren: props["hasChildren"],
        depth: props["depth"],
        controls: props["controls"],
      },
      React.createElement(
        LayerIcon,
        {
          class: "_68911af8",
          isElement: props["isElement"],
          isComponent: props["isComponent"],
          isInstance: props["isInstance"],
          isText: props["isText"],
        },
        null
      ),
      props["children"]
    );
  })
);
export { LayerLeaf };

var LayerIcon = React.memo(
  React.forwardRef(function LayerIcon(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_4bfdbf4f _2f84b91e _pub-2f84b91e" +
          (props["isElement"]
            ? " " + "_2f84b91e_is-element _pub-2f84b91e_is-element is-element"
            : "") +
          (props["isComponent"]
            ? " " +
              "_2f84b91e_is-component _pub-2f84b91e_is-component is-component"
            : "") +
          (props["isText"]
            ? " " + "_2f84b91e_is-text _pub-2f84b91e_is-text is-text"
            : "") +
          (props["isInstance"]
            ? " " +
              "_2f84b91e_is-instance _pub-2f84b91e_is-instance is-instance"
            : "") +
          (props["isStyle"]
            ? " " + "_2f84b91e_is-style _pub-2f84b91e_is-style is-style"
            : ""),
        ref: ref,
      },
      null
    );
  })
);

var VisibilityButton = React.memo(
  React.forwardRef(function VisibilityButton(props, ref) {
    return React.createElement(
      Icon,
      {
        class: "_a29e1a7a",
        ref: ref,
      },
      "\n  dddd\n"
    );
  })
);
export { VisibilityButton };

var Layers = React.memo(
  React.forwardRef(function Layers(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_4c907b56 _2f84b91e _pub-2f84b91e" +
          " " +
          "_2f84b91e_font-small _pub-2f84b91e_font-small font-small",
        ref: ref,
      },
      React.createElement(
        TreeBranch,
        {
          class: "_1b1b56dc",
          leaf: React.createElement(
            LayerLeaf,
            {
              class: "_7ba55a88",
              depth: "1",
              hasChildren: true,
              isComponent: true,
            },
            "\n      Container\n    "
          ),
        },
        null
      ),
      React.createElement(
        TreeBranch,
        {
          class: "_82120766",
          leaf: React.createElement(
            LayerLeaf,
            {
              class: "_5088094b",
              depth: "1",
              expanded: true,
              hasChildren: true,
              isElement: true,
            },
            "\n      Container\n    "
          ),
        },
        React.createElement(
          TreeBranch,
          {
            class: "_eae9a32c",
            active: true,
            leaf: React.createElement(
              LayerLeaf,
              {
                class: "_b1ee6af7",
                depth: "2",
                expanded: true,
                hasChildren: true,
                isElement: true,
              },
              "\n        Header\n      "
            ),
          },
          React.createElement(
            TreeBranch,
            {
              class: "_31c40ba9",
              leaf: React.createElement(
                LayerLeaf,
                {
                  class: "_5be00066",
                  depth: "3",
                  isElement: true,
                },
                "Navigation"
              ),
            },
            React.createElement(
              TreeBranch,
              {
                class: "_af3d9750",
                leaf: React.createElement(
                  LayerLeaf,
                  {
                    class: "_9f1fb342",
                    depth: "4",
                    hasChildren: true,
                    isInstance: true,
                    controls: React.createElement(
                      VisibilityButton,
                      {
                        class: "_f59fb194",
                      },
                      null
                    ),
                  },
                  "\n            Home Link\n          "
                ),
              },
              null
            ),
            React.createElement(
              TreeBranch,
              {
                class: "_d83aa7c6",
                leaf: React.createElement(
                  LayerLeaf,
                  {
                    class: "_86048203",
                    depth: "4",
                    hasChildren: true,
                    isInstance: true,
                  },
                  "\n            About Link\n          "
                ),
              },
              null
            ),
            React.createElement(
              TreeBranch,
              {
                class: "_4133f67c",
                leaf: React.createElement(
                  LayerLeaf,
                  {
                    class: "_ad29d1c0",
                    depth: "4",
                    expanded: true,
                    hasChildren: true,
                    isInstance: true,
                  },
                  "\n            Link\n          "
                ),
              },
              null
            ),
            React.createElement(
              TreeBranch,
              {
                class: "_3634c6ea",
                leaf: React.createElement(
                  LayerLeaf,
                  {
                    class: "_b432e081",
                    depth: "5",
                    hasChildren: true,
                    expanded: true,
                    isElement: true,
                    inInstance: true,
                  },
                  "\n            some slot\n          "
                ),
              },
              React.createElement(
                TreeBranch,
                {
                  class: "_91bc326b",
                  leaf: React.createElement(
                    LayerLeaf,
                    {
                      class: "_2e2adbc3",
                      depth: "6",
                      isText: true,
                    },
                    "Contact"
                  ),
                },
                null
              )
            ),
            React.createElement(
              TreeBranch,
              {
                class: "_a8505349",
                leaf: React.createElement(
                  LayerLeaf,
                  {
                    class: "_fb737646",
                    depth: "3",
                    isElement: true,
                  },
                  "\n            Right Controls\n          "
                ),
              },
              null
            )
          )
        ),
        React.createElement(
          TreeBranch,
          {
            class: "_9dee93ba",
            leaf: React.createElement(
              LayerLeaf,
              {
                class: "_dff26b20",
                depth: "2",
                hasChildren: true,
                expanded: true,
                isElement: true,
              },
              "\n        span\n      "
            ),
          },
          React.createElement(
            TreeBranch,
            {
              class: "_3006619e",
              leaf: React.createElement(
                LayerLeaf,
                {
                  class: "_e35c6703",
                  depth: "3",
                  isText: true,
                },
                "Some text"
              ),
            },
            null
          )
        )
      )
    );
  })
);
export { Layers };

var ComputedRules = React.memo(
  React.forwardRef(function ComputedRules(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_ab285651 _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      React.createElement(
        "ul",
        {
          className: "_66824b40 _2f84b91e _pub-2f84b91e",
        },
        React.createElement(
          "li",
          {
            className: "_565dc923 _2f84b91e _pub-2f84b91e",
          },
          "Show computed style rules"
        )
      )
    );
  })
);
export { ComputedRules };

var FieldRow = React.memo(
  React.forwardRef(function FieldRow(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_8ede8da0 _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { FieldRow };

var Field = React.memo(
  React.forwardRef(function Field(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_60d0ec8c _2f84b91e _pub-2f84b91e" +
          (props["inherited"]
            ? " " + "_2f84b91e_inherited _pub-2f84b91e_inherited inherited"
            : ""),
        ref: ref,
      },
      React.createElement(
        "label",
        {
          className: "_ea751ee _2f84b91e _pub-2f84b91e",
        },
        props["label"]
      ),
      props["children"]
    );
  })
);
export { Field };

var Paint = React.memo(
  React.forwardRef(function Paint(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_89b349b9 _2f84b91e _pub-2f84b91e" +
          " " +
          "_2f84b91e_font-small _pub-2f84b91e_font-small font-small",
        ref: ref,
      },
      React.createElement(
        PanelSection,
        {
          class: "_7d2d1dca",
        },
        React.createElement(
          Field,
          {
            class: "_623e661a",
            label: "Variant",
          },
          React.createElement(
            SelectInput,
            {
              class: "_53d62434",
              multi: true,
            },
            React.createElement(
              SelectInputValue,
              {
                class: "_c0033c4c",
              },
              "dark"
            ),
            React.createElement(
              SelectInputValue,
              {
                class: "_b7040cda",
              },
              "mobile"
            )
          )
        )
      ),
      React.createElement(
        PanelSection,
        {
          class: "_a2a2d5c",
          title: "Layout",
        },
        React.createElement(
          Field,
          {
            class: "_14fb3cbb",
            label: "display",
          },
          React.createElement(
            SelectInput,
            {
              class: "_6f7467b3",
            },
            React.createElement(
              SelectInputValue,
              {
                class: "_5b141e48",
              },
              "Flex"
            )
          )
        ),
        React.createElement(
          FieldRow,
          {
            class: "_63fc0c2d",
          },
          React.createElement(
            Field,
            {
              class: "_6eb60d84",
              label: "direction",
              inherited: true,
            },
            React.createElement(
              SelectInput,
              {
                class: "_667437f8",
              },
              React.createElement(
                SelectInputValue,
                {
                  class: "_23f2d072",
                },
                "row"
              )
            )
          ),
          React.createElement(
            Field,
            {
              class: "_19b13d12",
              label: "flex-wrap",
            },
            React.createElement(
              SelectInput,
              {
                class: "_67b65dcf",
              },
              React.createElement(
                SelectInputValue,
                {
                  class: "_1e92f9c2",
                },
                "nowrap"
              )
            )
          )
        ),
        React.createElement(
          FieldRow,
          {
            class: "_faf55d97",
          },
          React.createElement(
            Field,
            {
              class: "_6cf0b3dd",
              label: "justify-content",
            },
            React.createElement(
              SelectInput,
              {
                class: "_21d44d28",
              },
              React.createElement(
                SelectInputValue,
                {
                  class: "_121acaef",
                },
                "space-between"
              )
            )
          ),
          React.createElement(
            Field,
            {
              class: "_1bf7834b",
              label: "align-items",
            },
            React.createElement(
              SelectInput,
              {
                class: "_2016271f",
              },
              React.createElement(
                SelectInputValue,
                {
                  class: "_2f7ae35f",
                },
                "center"
              )
            )
          )
        ),
        React.createElement(
          FieldRow,
          {
            class: "_8df26d01",
          },
          React.createElement(
            Field,
            {
              class: "_6d32d9ea",
              label: "flex-flow",
            },
            React.createElement(
              SelectInput,
              {
                class: "_1cb46498",
                multi: true,
              },
              React.createElement(
                SelectInputValue,
                {
                  class: "_b46dc15b",
                },
                "row"
              )
            )
          )
        ),
        React.createElement(
          FieldRow,
          {
            class: "_1396f8a2",
          },
          React.createElement(
            Field,
            {
              class: "_687dcf6f",
              label: "Gap",
            },
            React.createElement(
              TextInput,
              {
                class: "_ae94b888",
                placeholder: "0",
              },
              null
            )
          ),
          React.createElement(
            Field,
            {
              class: "_1f7afff9",
              label: "flex-grow",
            },
            React.createElement(
              TextInput,
              {
                class: "_af56d2bf",
                placeholder: "0",
              },
              null
            )
          ),
          React.createElement(
            Field,
            {
              class: "_8673ae43",
              label: "flex-shrink",
            },
            React.createElement(
              TextInput,
              {
                class: "_ad106ce6",
                placeholder: "0",
              },
              null
            )
          )
        )
      ),
      React.createElement(
        PanelSection,
        {
          class: "_93237ce6",
          title: "Box",
        },
        "padding"
      ),
      React.createElement(
        PanelSection,
        {
          class: "_e4244c70",
          title: "Text",
        },
        null
      ),
      React.createElement(
        PanelSection,
        {
          class: "_7a40d9d3",
          title: "Background",
        },
        null
      ),
      React.createElement(
        PanelSection,
        {
          class: "_d47e945",
          title: "Background",
        },
        null
      )
    );
  })
);
export { Paint };

var SelectInputValue = React.memo(
  React.forwardRef(function SelectInputValue(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_67bd2895 _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { SelectInputValue };

var SelectInput = React.memo(
  React.forwardRef(function SelectInput(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_80050592 _2f84b91e _pub-2f84b91e" +
          (props["multi"]
            ? " " + "_2f84b91e_multi _pub-2f84b91e_multi multi"
            : ""),
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_330d438 _2f84b91e _pub-2f84b91e",
        },
        props["children"]
      ),
      React.createElement(
        "div",
        {
          className: "_9a398582 _2f84b91e _pub-2f84b91e",
        },
        null
      )
    );
  })
);
export { SelectInput };

var TextInput = React.memo(
  React.forwardRef(function TextInput(props, ref) {
    return React.createElement(
      "input",
      {
        className: "_97c5bce1 _2f84b91e _pub-2f84b91e",
        ref: ref,
        placeholder: props["placeholder"],
        value: props["value"],
      },
      null
    );
  })
);
export { TextInput };

var Files = React.memo(
  React.forwardRef(function Files(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_79cbddcd _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      React.createElement(
        "ul",
        {
          className: "_c11c061d _2f84b91e _pub-2f84b91e",
        },
        React.createElement(
          "li",
          {
            className: "_51257089 _2f84b91e _pub-2f84b91e",
          },
          "Filter Input"
        ),
        React.createElement(
          "li",
          {
            className: "_2622401f _2f84b91e _pub-2f84b91e",
          },
          "Flat list view"
        ),
        React.createElement(
          "li",
          {
            className: "_bf2b11a5 _2f84b91e _pub-2f84b91e",
          },
          "Show media"
        ),
        React.createElement(
          "li",
          {
            className: "_c82c2133 _2f84b91e _pub-2f84b91e",
          },
          "Nested files view"
        )
      )
    );
  })
);
export { Files };

var PanelSection = React.memo(
  React.forwardRef(function PanelSection(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_90a878f8 _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      props["title"] &&
        React.createElement(
          "div",
          {
            className: "_ab6cc163 _2f84b91e _pub-2f84b91e",
          },
          props["title"]
        ),
      React.createElement(
        "div",
        {
          className: "_2b9f1b83 _2f84b91e _pub-2f84b91e",
        },
        props["children"]
      )
    );
  })
);
export { PanelSection };

var PaneSectionTitle = React.memo(
  React.forwardRef(function PaneSectionTitle(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_7ea619d4 _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { PaneSectionTitle };

var PaneSectionHeader = React.memo(
  React.forwardRef(function PaneSectionHeader(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_991e34d3 _2f84b91e _pub-2f84b91e" +
          " " +
          "_2f84b91e_font-small _pub-2f84b91e_font-small font-small",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { PaneSectionHeader };

var SectionedPane = React.memo(
  React.forwardRef(function SectionedPane(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_d8842a26 _2f84b91e _pub-2f84b91e" +
          " " +
          "_2f84b91e_font-small _pub-2f84b91e_font-small font-small",
        ref: ref,
      },
      React.createElement(
        PaneSectionHeader,
        {
          class: "_2848da5c",
        },
        props["header"]
      ),
      props["children"]
    );
  })
);
export { SectionedPane };

var ListItem = React.memo(
  React.forwardRef(function ListItem(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_368a4b0a _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { ListItem };

var List = React.memo(
  React.forwardRef(function List(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_dfe9ee3f _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { List };

var Components = React.memo(
  React.forwardRef(function Components(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_31e78f13 _2f84b91e _pub-2f84b91e" +
          " " +
          "_2f84b91e_font-small _pub-2f84b91e_font-small font-small",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_5bc29678 _2f84b91e _pub-2f84b91e",
        },
        React.createElement(
          "div",
          {
            className: "_cea7d667 _2f84b91e _pub-2f84b91e",
          },
          React.createElement(
            "input",
            {
              className: "_75210c0c _2f84b91e _pub-2f84b91e",
              placeholder: "Filter...",
            },
            null
          )
        )
      ),
      React.createElement(
        SectionedPane,
        {
          class: "_2cc5a6ee",
          header: "Native HTML",
        },
        React.createElement(
          List,
          {
            class: "_b8628cc6",
          },
          React.createElement(
            ListItem,
            {
              class: "_3e847f1d",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_78fc4689",
                isText: true,
              },
              null
            ),
            "Text node\n      "
          ),
          React.createElement(
            ListItem,
            {
              class: "_49834f8b",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_793e2cbe",
                isElement: true,
              },
              null
            ),
            "div\n      "
          ),
          React.createElement(
            ListItem,
            {
              class: "_d08a1e31",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_7b7892e7",
                isElement: true,
              },
              null
            ),
            "form\n      "
          ),
          React.createElement(
            ListItem,
            {
              class: "_a78d2ea7",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_7abaf8d0",
                isElement: true,
              },
              null
            ),
            "dialog\n      "
          )
        )
      ),
      React.createElement(
        SectionedPane,
        {
          class: "_b5ccf754",
          header: "Custom Components",
        },
        React.createElement(
          List,
          {
            class: "_ba24329f",
          },
          React.createElement(
            ListItem,
            {
              class: "_792405cd",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_49145c14",
                isComponent: true,
              },
              null
            ),
            "SectionPane\n      "
          ),
          React.createElement(
            ListItem,
            {
              class: "_e23355b",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_48d63623",
                isComponent: true,
              },
              null
            ),
            "ListItem\n      "
          ),
          React.createElement(
            ListItem,
            {
              class: "_972a64e1",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_4a90887a",
                isComponent: true,
              },
              null
            ),
            "Something else\n      "
          ),
          React.createElement(
            ListItem,
            {
              class: "_e02d5477",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_4b52e24d",
                isComponent: true,
              },
              null
            ),
            "Home page\n      "
          )
        )
      ),
      React.createElement(
        SectionedPane,
        {
          class: "_c2cbc7c2",
          header: "Figma assets",
        },
        React.createElement(
          List,
          {
            class: "_bbe658a8",
          },
          React.createElement(
            ListItem,
            {
              class: "_44442c7d",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_ef6357a0",
                isComponent: true,
              },
              null
            ),
            "SectionPane\n      "
          ),
          React.createElement(
            ListItem,
            {
              class: "_33431ceb",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_eea13d97",
                isComponent: true,
              },
              null
            ),
            "ListItem\n      "
          ),
          React.createElement(
            ListItem,
            {
              class: "_aa4a4d51",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_ece783ce",
                isComponent: true,
              },
              null
            ),
            "Something else\n      "
          ),
          React.createElement(
            ListItem,
            {
              class: "_dd4d7dc7",
            },
            React.createElement(
              LayerIcon,
              {
                class: "_ed25e9f9",
                isComponent: true,
              },
              null
            ),
            "Home page\n      "
          )
        )
      ),
      React.createElement(
        "ul",
        {
          className: "_5caf5261 _2f84b91e _pub-2f84b91e",
        },
        React.createElement(
          "li",
          {
            className: "_bea94e2d _2f84b91e _pub-2f84b91e",
          },
          "MDN reference to each native element"
        )
      )
    );
  })
);
export { Components };

var Styles = React.memo(
  React.forwardRef(function Styles(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_d65fa214 _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      React.createElement(
        "ul",
        {
          className: "_515cbb72 _2f84b91e _pub-2f84b91e",
        },
        React.createElement(
          "li",
          {
            className: "_6905890 _2f84b91e _pub-2f84b91e",
          },
          "Filter Input"
        ),
        React.createElement(
          "li",
          {
            className: "_71976806 _2f84b91e _pub-2f84b91e",
          },
          "show style rules"
        ),
        React.createElement(
          "li",
          {
            className: "_e89e39bc _2f84b91e _pub-2f84b91e",
          },
          "show nested styles"
        ),
        React.createElement(
          "li",
          {
            className: "_9f99092a _2f84b91e _pub-2f84b91e",
          },
          "Show variables"
        ),
        React.createElement(
          "li",
          {
            className: "_1fd9c89 _2f84b91e _pub-2f84b91e",
          },
          "Show show mixins"
        )
      )
    );
  })
);
export { Styles };

var ExternalResources = React.memo(
  React.forwardRef(function ExternalResources(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_c19f1b67 _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      React.createElement(
        SectionedPane,
        {
          class: "_e7f38daf",
          header: "Figma assets",
        },
        React.createElement(
          "ul",
          {
            className: "_fdbcc0f4 _2f84b91e _pub-2f84b91e",
          },
          React.createElement(
            "li",
            {
              className: "_ac9e6309 _2f84b91e _pub-2f84b91e",
            },
            "display exported assets"
          ),
          React.createElement(
            "li",
            {
              className: "_db99539f _2f84b91e _pub-2f84b91e",
            },
            "ability to filter assets"
          ),
          React.createElement(
            "li",
            {
              className: "_42900225 _2f84b91e _pub-2f84b91e",
            },
            "ability to explicitly link layers to Figma"
          ),
          React.createElement(
            "li",
            {
              className: "_359732b3 _2f84b91e _pub-2f84b91e",
            },
            "Ability to import assets from other resources"
          )
        )
      )
    );
  })
);
export { ExternalResources };

var Icon = React.memo(
  React.forwardRef(function Icon(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_2f917a4b _2f84b91e _pub-2f84b91e" +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      null
    );
  })
);
export { Icon };

var ProjectNavigationButton = React.memo(
  React.forwardRef(function ProjectNavigationButton(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_c6f2df7e _2f84b91e _pub-2f84b91e" +
          (props["class"] ? " " + props["class"] : "") +
          (props["active"]
            ? " " + "_2f84b91e_active _pub-2f84b91e_active active"
            : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { ProjectNavigationButton };

var ProjectNavigation = React.memo(
  React.forwardRef(function ProjectNavigation(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_28fcbe52 _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      React.createElement(
        ProjectNavigationButton,
        {
          class: "_9479c18b",
          active: props["showFiles"],
        },
        React.createElement(
          Icon,
          {
            class: "_733e5f63",
          },
          null
        )
      ),
      React.createElement(
        ProjectNavigationButton,
        {
          class: "_d709031",
          active: props["showInsert"],
        },
        React.createElement(
          Icon,
          {
            class: "_7178e13a",
          },
          null
        )
      ),
      React.createElement(
        ProjectNavigationButton,
        {
          class: "_7a77a0a7",
          active: props["showLayers"],
        },
        React.createElement(
          Icon,
          {
            class: "_70ba8b0d",
          },
          null
        )
      )
    );
  })
);
export { ProjectNavigation };

var ObjectNavigation = React.memo(
  React.forwardRef(function ObjectNavigation(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_cf449355 _2f84b91e _pub-2f84b91e",
        ref: ref,
      },
      React.createElement(
        ProjectNavigationButton,
        {
          class: "_9ee7ec81",
          active: props["showPaint"],
        },
        React.createElement(
          Icon,
          {
            class: "_cc0ee102",
          },
          null
        )
      ),
      React.createElement(
        ProjectNavigationButton,
        {
          class: "_7eebd3b",
          active: props["showRules"],
        },
        React.createElement(
          Icon,
          {
            class: "_ce485f5b",
          },
          null
        )
      ),
      React.createElement(
        ProjectNavigationButton,
        {
          class: "_70e98dad",
          active: props["showComputed"],
        },
        React.createElement(
          Icon,
          {
            class: "_cf8a356c",
          },
          null
        )
      )
    );
  })
);
export { ObjectNavigation };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_eab248a4 _2f84b91e _pub-2f84b91e" +
          " " +
          "_2f84b91e_font-regular _pub-2f84b91e_font-regular font-regular",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_824112d7 _2f84b91e _pub-2f84b91e",
        },
        React.createElement(
          ProjectNavigation,
          {
            class: "_94e4b941",
            showLayers: props["showLayers"],
            showFiles: props["showFiles"],
            showInsert: props["showInsert"],
            showStyles: props["showStyles"],
            showFigma: props["showFigma"],
          },
          null
        ),
        React.createElement(
          Gutter,
          {
            class: "_e3e389d7",
            left: true,
          },
          props["showLayers"] &&
            React.createElement(
              Layers,
              {
                class: "_6dcfb968",
              },
              null
            ),
          props["showFiles"] &&
            React.createElement(
              Files,
              {
                class: "_74d48829",
              },
              null
            ),
          props["showInsert"] &&
            React.createElement(
              Components,
              {
                class: "_5ff9dbea",
              },
              null
            ),
          props["showStyles"] &&
            React.createElement(
              Styles,
              {
                class: "_46e2eaab",
              },
              null
            ),
          props["showFigma"] &&
            React.createElement(
              ExternalResources,
              {
                class: "_9a37c6c",
              },
              null
            )
        ),
        React.createElement(
          "div",
          {
            className: "_7d871c74 _2f84b91e _pub-2f84b91e",
          },
          React.createElement(
            "div",
            {
              className: "_f67684aa _2f84b91e _pub-2f84b91e",
            },
            React.createElement(
              "div",
              {
                className: "_8e10ad06 _2f84b91e _pub-2f84b91e",
              },
              "\n          Some file\n        "
            ),
            React.createElement(
              "div",
              {
                className: "_601ecc2a _2f84b91e _pub-2f84b91e",
              },
              React.createElement(
                "div",
                {
                  className: "_cd946a87 _2f84b91e _pub-2f84b91e",
                },
                React.createElement(
                  "div",
                  {
                    className: "_e9880374 _2f84b91e _pub-2f84b91e",
                  },
                  "This is a title"
                ),
                React.createElement(
                  "div",
                  {
                    className: "_708152ce _2f84b91e _pub-2f84b91e",
                  },
                  null
                )
              )
            )
          )
        ),
        React.createElement(
          Gutter,
          {
            class: "_93897d58",
            right: true,
          },
          React.createElement(
            ObjectNavigation,
            {
              class: "_1bfc31e8",
              showComputed: props["showComputed"],
              showRules: props["showRules"],
              showPaint: props["showPaint"],
            },
            null
          ),
          props["showComputed"] &&
            React.createElement(
              ComputedRules,
              {
                class: "_430a781b",
              },
              null
            ),
          props["showRules"] &&
            React.createElement(
              "StyleRules",
              {
                className: "_68272bd8 _2f84b91e _pub-2f84b91e",
              },
              null
            ),
          props["showPaint"] &&
            React.createElement(
              Paint,
              {
                class: "_713c1a99",
              },
              null
            )
        )
      )
    );
  })
);
