import React from "react";
import _pubA1B1A854 from "../../../../styles/utils.pc";
import _pubB4F56Def, {
  FilterTextInput as _pubB4F56Def_FilterTextInput,
} from "../../../TextInput/filter.pc";
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

var Cell = React.memo(
  React.forwardRef(function Cell(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_ad8b9f8b _1d925283 _pub-1d925283" +
          " " +
          "_1d925283_v2 _pub-1d925283_v2 v2 " +
          (props["class"] ? " " + props["class"] : "") +
          (props["warn"]
            ? " " + "_1d925283_warn _pub-1d925283_warn warn"
            : "") +
          (props["hover"]
            ? " " + "_1d925283_hover _pub-1d925283_hover hover"
            : ""),
        ref: ref,
        "data-label": "Cell",
        onClick: props["onClick"],
        onMouseDown: props["onMouseDown"],
      },
      React.createElement(
        "div",
        {
          className: "_11e37b4e _1d925283 _pub-1d925283",
          "data-label": "Inner",
        },
        React.createElement(
          "div",
          {
            className: "_990093f6 _1d925283 _pub-1d925283",
            title: props["dir"],
          },
          React.createElement(
            "div",
            {
              className: "_1bcd55ef _1d925283 _pub-1d925283",
            },
            props["label"]
          ),
          React.createElement(
            "div",
            {
              className: "_82c40455 _1d925283 _pub-1d925283",
            },
            props["dir"]
          ),
          React.createElement(
            "div",
            {
              className: "_f5c334c3 _1d925283 _pub-1d925283",
            },
            props["controls"]
          )
        ),
        React.createElement(
          "div",
          {
            className: "_9c24c _1d925283 _pub-1d925283",
            ref: props["mountRef"],
          },
          props["children"],
          React.createElement(
            "div",
            {
              className: "_f7858a9a _1d925283 _pub-1d925283",
            },
            null
          )
        )
      )
    );
  })
);
export { Cell };

var WarningIcon = React.memo(
  React.forwardRef(function WarningIcon(props, ref) {
    return React.createElement(
      "i",
      {
        className:
          "_44e83abe _1d925283 _pub-1d925283" +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      null
    );
  })
);

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_aae65b92 _1d925283 _pub-1d925283",
        ref: ref,
        "data-label": "Container",
      },
      props["children"]
    );
  })
);
export { Container };

var Header = React.memo(
  React.forwardRef(function Header(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_4d5e7695 _1d925283 _pub-1d925283" +
          " " +
          "_1d925283_v2 _pub-1d925283_v2 v2",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Header };

var Cells = React.memo(
  React.forwardRef(function Cells(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_cb2d5c02 _1d925283 _pub-1d925283",
        ref: ref,
        "data-zoom": props["zoom"],
        "data-label": "Cells",
      },
      props["children"]
    );
  })
);
export { Cells };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      Container,
      {
        class: "_25233d2e",
        ref: ref,
      },
      React.createElement(
        Header,
        {
          class: "_63422834",
        },
        React.createElement(
          _pubB4F56Def_FilterTextInput,
          {
            class: "_c9b540f3 _1d925283 _pub-1d925283",
          },
          null
        )
      ),
      React.createElement(
        "div",
        {
          className: "_fa4b798e _1d925283 _pub-1d925283",
        },
        null
      ),
      React.createElement(
        Cells,
        {
          class: "_1328dcbb",
          zoom: props["zoom"],
        },
        React.createElement(
          Cell,
          {
            class: "_cf7e8218",
            label: "Topbar",
            dir: "src/components/test",
            warn: true,
          },
          React.createElement(
            "img",
            {
              className: "_c687cd97 _1d925283 _pub-1d925283",
              src: "./previews/0116800ba0b4383678bf58b68c18e3ec25bf8f2a0f86e02e9eef21182e0b00c9.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_b879b28e",
            label: "Analaytics",
            hover: true,
            dir: "src/components/test/another",
          },
          React.createElement(
            "img",
            {
              className: "_c745a7a0 _1d925283 _pub-1d925283",
              src: "./previews/1872b7970e0515d14738fc30b340ed3c9bbe5743fc6897d90d2e4b364e27d578.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_2170e334",
            label: "LinkAccounts",
          },
          React.createElement(
            "img",
            {
              className: "_c50319f9 _1d925283 _pub-1d925283",
              src: "./previews/2751624e31a0079e58548e88ace6de6e4e844f67a4bd651a996a0fa1d8f49da9.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_5677d3a2",
            label: "ButtonGroup",
          },
          React.createElement(
            "img",
            {
              className: "_c4c173ce _1d925283 _pub-1d925283",
              src: "./previews/29486a432b90d3cc24a18501358a4cdc73cbe9f875738557dff1680a339660cb.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_c8134601",
            label: "Modal",
            warn: true,
          },
          React.createElement(
            "img",
            {
              className: "_c18e654b _1d925283 _pub-1d925283",
              src: "./previews/493420fe6b2b28bf69d2413ab1211194ec01254209b7dff42510a6b700d65b3b.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_bf147697",
            label: "Topbar",
          },
          React.createElement(
            "img",
            {
              className: "_c04c0f7c _1d925283 _pub-1d925283",
              src: "./previews/4ef8588d3e22e320ef7ad28a8c2bbf808d2a8c48dc6a9205071f66229eed4b56.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_261d272d",
            label: "ResetPasswordPreview",
            warn: true,
          },
          React.createElement(
            "img",
            {
              className: "_c20ab125 _1d925283 _pub-1d925283",
              src: "./previews/5527651372db1946b99973f3d60148ed9718bf5c68fea4fcd22392d5e0e33b14.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_511a17bb",
            label: "LoginPage",
          },
          React.createElement(
            "img",
            {
              className: "_c3c8db12 _1d925283 _pub-1d925283",
              src: "./previews/57316dacf231109e3c40c3b422dd119c8e268fc8ee71b6ad8b1e641a632396d5.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_c1a50a2a",
            label: "",
          },
          React.createElement(
            "img",
            {
              className: "_c8949c2f _1d925283 _pub-1d925283",
              src: "./previews/5f8d7fa9f7f22c7af7daa3b32ffd8a963f87e5cfc09fe49769eab00363b5250c.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_b6a23abc",
            label: "Inputs / Text",
          },
          React.createElement(
            "img",
            {
              className: "_c956f618 _1d925283 _pub-1d925283",
              src: "./previews/7d0f27f26875a7061dc3dd61e0129585e70e740c62c7d662cabc40ba5ad0c492.jpg",
            },
            null
          )
        ),
        React.createElement(
          Cell,
          {
            class: "_fe6308b4",
            label: "Inputs / Button",
          },
          React.createElement(
            "img",
            {
              className: "_c9586551 _1d925283 _pub-1d925283",
              src: "./previews/85b0943f9426ecaee1187137b94283cd8cd8bc8023a3d2290f2f45ba517f07af.jpg",
            },
            null
          )
        )
      )
    );
  })
);
export { Preview };

var PreviewEmpty = React.memo(
  React.forwardRef(function PreviewEmpty(props, ref) {
    return React.createElement(
      Container,
      {
        class: "_cc40981b",
        ref: ref,
      },
      React.createElement(
        Header,
        {
          class: "_10c86410",
        },
        React.createElement(
          "Filter",
          {
            className: "_4737df64 _1d925283 _pub-1d925283",
          },
          null
        )
      ),
      React.createElement(
        Cells,
        {
          class: "_67cf5486",
        },
        null
      )
    );
  })
);
export { PreviewEmpty };
