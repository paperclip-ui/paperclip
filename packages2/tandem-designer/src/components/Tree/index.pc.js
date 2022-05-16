import React from "react";
import _pubA1B1A854 from "../../styles/utils.pc";
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

var Node = React.memo(
  React.forwardRef(function Node(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_3128f21b _cb76a400 _pub-cb76a400 _pub-1b5d7030" +
          " " +
          "_cb76a400_node _pub-cb76a400_node _pub-1b5d7030_node node " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
        style: castStyle("--depth: " + props["depth"]),
      },
      React.createElement(
        "div",
        {
          className:
            "_caa821a8 _cb76a400 _pub-cb76a400 _pub-1b5d7030" +
            " " +
            "_cb76a400_leaf _pub-cb76a400_leaf _pub-1b5d7030_leaf leaf" +
            (props["alt"]
              ? " " +
                "_cb76a400_leaf--alt _pub-cb76a400_leaf--alt _pub-1b5d7030_leaf--alt leaf--alt"
              : "") +
            (props["hovering"]
              ? " " +
                "_cb76a400_leaf--hovering _pub-cb76a400_leaf--hovering _pub-1b5d7030_leaf--hovering leaf--hovering"
              : "") +
            (props["selected"]
              ? " " +
                "_cb76a400_leaf--selected _pub-cb76a400_leaf--selected _pub-1b5d7030_leaf--selected leaf--selected"
              : "") +
            (props["open"]
              ? " " +
                "_cb76a400_leaf--hasChildren--open _pub-cb76a400_leaf--hasChildren--open _pub-1b5d7030_leaf--hasChildren--open leaf--hasChildren--open"
              : "") +
            (props["hasChildren"]
              ? " " +
                "_cb76a400_leaf--hasChildren _pub-cb76a400_leaf--hasChildren _pub-1b5d7030_leaf--hasChildren leaf--hasChildren"
              : ""),
          onClick: props["onLeafClick"],
        },
        props["icon"],
        props["leaf"],
        React.createElement(
          "div",
          {
            className:
              "_8393f587 _cb76a400 _pub-cb76a400 _pub-1b5d7030" +
              " " +
              "_cb76a400_controls _pub-cb76a400_controls _pub-1b5d7030_controls controls",
          },
          props["controls"]
        )
      ),
      React.createElement(
        "div",
        {
          className:
            "_53a17012 _cb76a400 _pub-cb76a400 _pub-1b5d7030" +
            " " +
            "_cb76a400_child-nodes _pub-cb76a400_child-nodes _pub-1b5d7030_child-nodes child-nodes",
        },
        props["children"]
      )
    );
  })
);
export { Node };

var FileIcon = React.memo(
  React.forwardRef(function FileIcon(props, ref) {
    return React.createElement(
      "i",
      {
        className: "_d84b572e _cb76a400 _pub-cb76a400 _pub-1b5d7030",
        ref: ref,
        "data-extension": props["extension"],
      },
      null
    );
  })
);
export { FileIcon };

var FolderIcon = React.memo(
  React.forwardRef(function FolderIcon(props, ref) {
    return React.createElement(
      "i",
      {
        className: "_36453602 _cb76a400 _pub-cb76a400 _pub-1b5d7030",
        ref: ref,
      },
      null
    );
  })
);
export { FolderIcon };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_d1fd1b05 _cb76a400 _pub-cb76a400 _pub-1b5d7030",
        ref: ref,
      },
      React.createElement(
        Node,
        {
          class: "_b03894e8",
          leaf: "src",
          depth: "0",
          icon: React.createElement(
            FolderIcon,
            {
              class: "_b4b4ecd3",
            },
            null
          ),
          hasChildren: true,
          open: true,
        },
        React.createElement(
          Node,
          {
            class: "_26efe63d",
            leaf: "components",
            icon: React.createElement(
              FolderIcon,
              {
                class: "_db924c40",
              },
              null
            ),
            hasChildren: true,
            depth: "1",
            alt: true,
            open: true,
          },
          React.createElement(
            Node,
            {
              class: "_64ab51a0",
              leaf: "Button.tsx",
              icon: React.createElement(
                FileIcon,
                {
                  class: "_556ee70e",
                },
                null
              ),
              depth: "2",
              isFile: true,
            },
            null
          ),
          React.createElement(
            Node,
            {
              class: "_13ac6136",
              leaf: "Button.pc",
              icon: React.createElement(
                FileIcon,
                {
                  class: "_4c75d64f",
                  extension: "pc",
                },
                null
              ),
              depth: "2",
              selected: true,
              isFile: true,
            },
            null
          ),
          React.createElement(
            Node,
            {
              class: "_8aa5308c",
              leaf: "index.tsx",
              icon: React.createElement(
                FileIcon,
                {
                  class: "_6758858c",
                },
                null
              ),
              depth: "2",
              isFile: true,
            },
            null
          )
        ),
        React.createElement(
          Node,
          {
            class: "_51e8d6ab",
            leaf: "reducers",
            icon: React.createElement(
              FolderIcon,
              {
                class: "_c2897d01",
              },
              null
            ),
            hasChildren: true,
            depth: "1",
            alt: true,
            open: true,
          },
          React.createElement(
            Node,
            {
              class: "_65693b97",
              leaf: "main.ts",
              icon: React.createElement(
                FileIcon,
                {
                  class: "_edd2806b",
                },
                null
              ),
              depth: "2",
              hovering: true,
              isFile: true,
            },
            null
          )
        ),
        React.createElement(
          Node,
          {
            class: "_c8e18711",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_e9a42ec2",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_bfe6b787",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_f0bf1f83",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_21822224",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_bffe8944",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_568512b2",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_a6e5b805",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_cf8c4308",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_8dc8ebc6",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_b88b739e",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_94d3da87",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_28346e0f",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_134bc648",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_5f335e99",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_a50f709",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_b58e4d97",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_ed02671d",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_c2897d01",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_f419565c",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_5b802cbb",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_df34059f",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_2c871c2d",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_c62f34de",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_b2e3898e",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_896ea219",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_c5e4b918",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_90759358",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_5cede8a2",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_bb58c09b",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_2bead834",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_a243f1da",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_bb55c5a5",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_25dbed15",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_cc52f533",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_3cc0dc54",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_9ea31e54",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_ef44d944",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_e9a42ec2",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_f65fe805",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_70ad7f78",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_dd72bbc6",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_7aa4fee",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_c4698a87",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_99ceda4d",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_8b281c40",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_eec9eadb",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_92332d01",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_77c0bb61",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_b91e7ec2",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_c78bf7",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_a0054f83",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_90789666",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_279d534c",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_e77fa6f0",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_3e86620d",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_87b82f15",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_ee86b373",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_f0bf1f83",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_f79d8232",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_69b64e39",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_dcb0d1f1",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_1eb17eaf",
            leaf: "index.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_c5abe0b0",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        ),
        React.createElement(
          Node,
          {
            class: "_80d5eb0c",
            leaf: "last.ts",
            icon: React.createElement(
              FileIcon,
              {
                class: "_8aea7677",
              },
              null
            ),
            depth: "1",
            alt: true,
            open: true,
          },
          null
        )
      )
    );
  })
);
export { Preview };
