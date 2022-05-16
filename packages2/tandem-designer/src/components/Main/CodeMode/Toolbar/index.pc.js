import React from "react";
import _pub1B5D7030 from "../../../../../../tandem-design-system/src/atoms.pc";
import _pubA1B1A854 from "../../../../styles/utils.pc";
import _pubC2A10A92, {
  Menu as _pubC2A10A92_Menu,
  MenuItem as _pubC2A10A92_MenuItem,
  Container as _pubC2A10A92_Container,
} from "../../../Select/index2.pc";
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

var Tab = React.memo(
  React.forwardRef(function Tab(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_2c8c51c1 _4dc2923d _pub-4dc2923d _pub-1b5d7030" +
          (props["active"]
            ? " " +
              "_4dc2923d_active _pub-4dc2923d_active _pub-1b5d7030_active active"
            : "") +
          (props["hover"]
            ? " " +
              "_4dc2923d_hover _pub-4dc2923d_hover _pub-1b5d7030_hover hover"
            : ""),
        ref: ref,
      },
      props["children"],
      React.createElement(
        "button",
        {
          className:
            "_67a9b271 _4dc2923d _pub-4dc2923d _pub-1b5d7030" +
            " " +
            "_4dc2923d_remove-button _pub-4dc2923d_remove-button _pub-1b5d7030_remove-button remove-button",
          onClick: props["onRemoveButtonClick"],
        },
        "\n    ×\n  "
      )
    );
  })
);
export { Tab };

var AddFileButton = React.memo(
  React.forwardRef(function AddFileButton(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_cb347cc6 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
        onClick: props["onClick"],
      },
      "\n  +\n"
    );
  })
);
export { AddFileButton };

var Topbar = React.memo(
  React.forwardRef(function Topbar(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_57d53791 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Topbar };

var FileSelect = React.memo(
  React.forwardRef(function FileSelect(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_b9db56bd _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
        tabIndex: "0",
        onMouseDown: props["onMouseDown"],
        onBlur: props["onBlur"],
      },
      React.createElement(
        "div",
        {
          className:
            "_e34ed5c5 _4dc2923d _pub-4dc2923d _pub-1b5d7030" +
            (props["active"]
              ? " " +
                "_4dc2923d_active _pub-4dc2923d_active _pub-1b5d7030_active active"
              : ""),
          onClick: props["onButtonClick"],
        },
        React.createElement(
          "div",
          {
            className: "_7019ae34 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
            title: props["name"],
          },
          props["name"]
        ),
        React.createElement(
          "i",
          {
            className: "_e910ff8e _4dc2923d _pub-4dc2923d _pub-1b5d7030",
          },
          null
        )
      ),
      props["menu"]
    );
  })
);
export { FileSelect };

var FileMenu = React.memo(
  React.forwardRef(function FileMenu(props, ref) {
    return React.createElement(
      _pubC2A10A92_Menu,
      {
        class: "_50b8f388 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
        dark: true,
      },
      props["children"]
    );
  })
);
export { FileMenu };

var FileMenuItem = React.memo(
  React.forwardRef(function FileMenuItem(props, ref) {
    return React.createElement(
      _pubC2A10A92_MenuItem,
      {
        class: "_beb692a4 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
        noFocus: props["noFocus"],
        hover: props["hover"],
        onClick: props["onClick"],
      },
      props["children"],
      props["moreSelect"]
    );
  })
);
export { FileMenuItem };

var EyeButton = React.memo(
  React.forwardRef(function EyeButton(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_590ebfa3 _4dc2923d _pub-4dc2923d _pub-1b5d7030" +
          (props["highlight"]
            ? " " +
              "_4dc2923d_highlight _pub-4dc2923d_highlight _pub-1b5d7030_highlight highlight"
            : ""),
        ref: ref,
        onClick: props["onClick"],
      },
      React.createElement(
        "i",
        {
          className: "_eed95013 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        },
        null
      )
    );
  })
);
export { EyeButton };

var UploadButton = React.memo(
  React.forwardRef(function UploadButton(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_7cf86452 _4dc2923d _pub-4dc2923d _pub-1b5d7030" +
          (props["highlight"]
            ? " " +
              "_4dc2923d_highlight _pub-4dc2923d_highlight _pub-1b5d7030_highlight highlight"
            : ""),
        ref: ref,
      },
      React.createElement(
        "i",
        {
          className: "_f27fae45 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        },
        null
      ),
      "\n  Add file\n  ",
      React.createElement(
        "input",
        {
          className: "_1c71cf69 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
          type: "file",
          onChange: props["onChange"],
        },
        null
      )
    );
  })
);
export { UploadButton };

var MoreFileSelect = React.memo(
  React.forwardRef(function MoreFileSelect(props, ref) {
    return React.createElement(
      _pubC2A10A92_Container,
      {
        class:
          "_92f6057e _4dc2923d _pub-4dc2923d _pub-1b5d7030" +
          " " +
          "_4dc2923d_more-file-select _pub-4dc2923d_more-file-select _pub-1b5d7030_more-file-select more-file-select",
        ref: ref,
        onClick: props["onClick"],
        onBlur: props["onBlur"],
      },
      props["children"],
      props["menu"]
    );
  })
);
export { MoreFileSelect };

var MoreFileMenu = React.memo(
  React.forwardRef(function MoreFileMenu(props, ref) {
    return React.createElement(
      _pubC2A10A92_Menu,
      {
        class: "_7b95a04b _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
        style: castStyle(props["style"]),
      },
      React.createElement(
        _pubC2A10A92_MenuItem,
        {
          class: "_f5760699 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
          onClick: props["onRenameClick"],
        },
        "Rename"
      ),
      React.createElement(
        _pubC2A10A92_MenuItem,
        {
          class: "_6c7f5723 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
          onClick: props["onRemoveClick"],
        },
        "\n    Delete\n    ",
        React.createElement(
          "i",
          {
            className: "_7b8b9763 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
          },
          null
        )
      )
    );
  })
);
export { MoreFileMenu };

var MoreFileButton = React.memo(
  React.forwardRef(function MoreFileButton(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_959bc167 _4dc2923d _pub-4dc2923d _pub-1b5d7030" +
          (props["highlight"]
            ? " " +
              "_4dc2923d_highlight _pub-4dc2923d_highlight _pub-1b5d7030_highlight highlight"
            : ""),
        ref: ref,
        onClick: props["onClick"],
      },
      React.createElement(
        "i",
        {
          className: "_f6f2d2f7 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        },
        null
      )
    );
  })
);
export { MoreFileButton };

var AddDocumentButton = React.memo(
  React.forwardRef(function AddDocumentButton(props, ref) {
    return React.createElement(
      _pubC2A10A92_MenuItem,
      {
        class:
          "_7223ec60 _4dc2923d _pub-4dc2923d _pub-1b5d7030" +
          (props["media"]
            ? " " +
              "_4dc2923d_media _pub-4dc2923d_media _pub-1b5d7030_media media"
            : "") +
          (props["page"]
            ? " " + "_4dc2923d_page _pub-4dc2923d_page _pub-1b5d7030_page page"
            : ""),
        ref: ref,
        onMouseDown: props["onMouseDown"],
        onClick: props["onClick"],
      },
      React.createElement(
        "div",
        {
          className: "_fc6cfffd _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        },
        React.createElement(
          "i",
          {
            className: "_bc3dc43b _4dc2923d _pub-4dc2923d _pub-1b5d7030",
          },
          null
        ),
        React.createElement(
          "div",
          {
            className: "_25349581 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
          },
          props["children"]
        )
      ),
      props["media"] &&
        React.createElement(
          "input",
          {
            className: "_1c066ebc _4dc2923d _pub-4dc2923d _pub-1b5d7030",
            type: "file",
            onChange: props["onChange"],
            accept: props["accept"],
          },
          null
        )
    );
  })
);
export { AddDocumentButton };

var MenuFooter = React.memo(
  React.forwardRef(function MenuFooter(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_65e35513 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { MenuFooter };

var FileMenuItems = React.memo(
  React.forwardRef(function FileMenuItems(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_8bed343f _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { FileMenuItems };

var Spacer = React.memo(
  React.forwardRef(function Spacer(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_628e910a _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
      },
      null
    );
  })
);
export { Spacer };

var RightControls = React.memo(
  React.forwardRef(function RightControls(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_8c80f026 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { RightControls };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      Topbar,
      {
        class: "_6b38dd21",
        ref: ref,
      },
      React.createElement(
        FileSelect,
        {
          class: "_33d7a80e",
          name: "super-log-main file that.pc",
          active: props["showFileMenu"],
          menu:
            props["showFileMenu"] &&
            React.createElement(
              FileMenu,
              {
                class: "_fd5e44a2",
              },
              React.createElement(
                FileMenuItems,
                {
                  class: "_aaaade00",
                },
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_26412dc5",
                  },
                  "Buttons.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_51461d53",
                  },
                  "Typography.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_c84f4ce9",
                  },
                  "Colors.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_bf487c7f",
                    hover: true,
                    moreSelect: React.createElement(
                      MoreFileSelect,
                      {
                        class: "_43d9cb66",
                      },
                      React.createElement(
                        MoreFileButton,
                        {
                          class: "_783bec7c",
                        },
                        null
                      )
                    ),
                  },
                  "\n          Super-long-file-name-that-should-wrap-around.png\n        "
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_212ce9dc",
                  },
                  "Colors.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_562bd94a",
                    hover: true,
                  },
                  "Colors.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_cf2288f0",
                  },
                  "Molecules / Select.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_b825b866",
                  },
                  "Molecules / Select.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_289aa5f7",
                  },
                  "Molecules / Select.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_5f9d9561",
                  },
                  "Molecules / Select.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_6e89972",
                  },
                  "Molecules / Select.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_71efa9e4",
                  },
                  "Molecules / Select.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_e8e6f85e",
                  },
                  "Molecules / Select.pc"
                ),
                React.createElement(
                  FileMenuItem,
                  {
                    class: "_9fe1c8c8",
                  },
                  React.createElement(
                    _pubB4A1Dc67,
                    {
                      class: "_d1b6f099 _4dc2923d _pub-4dc2923d _pub-1b5d7030",
                    },
                    null
                  )
                )
              ),
              React.createElement(
                MenuFooter,
                {
                  class: "_ddadee96",
                },
                React.createElement(
                  AddDocumentButton,
                  {
                    class: "_278347f2",
                    page: true,
                  },
                  "Create new page"
                ),
                React.createElement(
                  AddDocumentButton,
                  {
                    class: "_50847764",
                    media: true,
                  },
                  "Upload file"
                )
              )
            ),
        },
        null
      ),
      React.createElement(
        Spacer,
        {
          class: "_44d09898",
        },
        null
      ),
      React.createElement(
        EyeButton,
        {
          class: "_ddd9c922",
        },
        null
      )
    );
  })
);
export { Preview };
