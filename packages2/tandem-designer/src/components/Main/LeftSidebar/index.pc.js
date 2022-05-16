import React from "react";
import _pub536876De, {
  Container as _pub536876De_Container,
} from "../../Pane/index.pc";
import _pub2Fbbb374, {
  Preview as _pub2Fbbb374_Preview,
} from "./files/index.pc";
import _pub5B18B464, {
  Preview as _pub5B18B464_Preview,
} from "./symbols/index.pc";
import _pubAa109E70 from "../../ResizableContainer/index.pc";
import _pubA1B1A854 from "../../../styles/utils.pc";
import _pub1B5D7030 from "../../../../../tandem-design-system/src/atoms.pc";
import _pubCc252Ee9 from "../../Select/index.pc";
import _pub7127F744, {
  Preview as _pub7127F744_Preview,
} from "./Header/index.pc";
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

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_b5137522 _b4ea63c _pub-b4ea63c _pub-1b5d7030",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Container };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      _pubAa109E70,
      {
        class: "_9ed0372e _b4ea63c _pub-b4ea63c _pub-1b5d7030",
        ref: ref,
        scrollable: true,
        left: true,
      },
      React.createElement(
        Container,
        {
          class: "_f4904a4f",
        },
        React.createElement(
          _pub7127F744_Preview,
          {
            class: "_a6c27768 _b4ea63c _pub-b4ea63c _pub-1b5d7030",
          },
          null
        ),
        React.createElement(
          _pub536876De_Container,
          {
            class: "_d1c547fe _b4ea63c _pub-b4ea63c _pub-1b5d7030",
          },
          React.createElement(
            _pub5B18B464_Preview,
            {
              class: "_25adb179 _b4ea63c _pub-b4ea63c _pub-1b5d7030",
            },
            null
          ),
          React.createElement(
            _pub2Fbbb374_Preview,
            {
              class: "_52aa81ef _b4ea63c _pub-b4ea63c _pub-1b5d7030",
            },
            null
          )
        )
      )
    );
  })
);
export { Preview };
