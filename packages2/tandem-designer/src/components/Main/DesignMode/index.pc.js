import React from "react";
import _pub7E7D388E, {
  Preview as _pub7E7D388E_Preview,
} from "./Toolbar/index.pc";
import _pub11C5A67F, {
  Preview as _pub11C5A67F_Preview,
} from "./Toolbar/index2.pc";
import _pub1D925283, {
  Preview as _pub1D925283_Preview,
  PreviewEmpty as _pub1D925283_PreviewEmpty,
} from "./Birdseye/index.pc";
import _pub9A1D806, { Preview as _pub9A1D806_Preview } from "./Canvas/index.pc";
import _pub3037Cf6A, {
  Preview as _pub3037Cf6A_Preview,
} from "./RightSidebar/index.pc";
import _pub9F0B6Cab, {
  Preview as _pub9F0B6Cab_Preview,
} from "./Footer/index.pc";
import _pubB7C93A9, {
  Preview as _pubB7C93A9_Preview,
} from "./Quickfind/index.pc";
import _pub4Bf59013, {
  Preview as _pub4Bf59013_Preview,
} from "./MediaPreview/index.pc";
import _pub1B5D7030 from "../../../../../tandem-design-system/src/atoms.pc";
import _pub125B0661, {
  Container as _pub125B0661_Container,
} from "./WindowResizer/index.pc";
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
        className:
          "_ac29cd08 _dcc36159 _pub-dcc36159 _pub-1b5d7030" +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
        style: castStyle(props["style"]),
        "data-label": "Design mode Container",
      },
      props["children"]
    );
  })
);
export { Container };

var CanvasContainer = React.memo(
  React.forwardRef(function CanvasContainer(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_4227ac24 _dcc36159 _pub-dcc36159 _pub-1b5d7030" +
          (props["disabled"]
            ? " " +
              "_dcc36159_disabled _pub-dcc36159_disabled _pub-1b5d7030_disabled disabled"
            : ""),
        ref: ref,
        "data-label": "Canvas Container",
      },
      props["children"]
    );
  })
);
export { CanvasContainer };

var Center = React.memo(
  React.forwardRef(function Center(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_ab440911 _dcc36159 _pub-dcc36159 _pub-1b5d7030",
        ref: ref,
        "data-label": "Center",
      },
      props["children"]
    );
  })
);
export { Center };

var NoPreview = React.memo(
  React.forwardRef(function NoPreview(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_454a683d _dcc36159 _pub-dcc36159 _pub-1b5d7030",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_19acacb4 _dcc36159 _pub-dcc36159 _pub-1b5d7030",
        },
        "\n    No preview for this file\n  "
      )
    );
  })
);
export { NoPreview };

var CanvasContainerPreview = React.memo(
  React.forwardRef(function CanvasContainerPreview(props, ref) {
    return React.createElement(
      CanvasContainer,
      {
        class: "_a2f2453a",
        ref: ref,
      },
      props["showGrid"] &&
        React.createElement(
          _pub1D925283_Preview,
          {
            class: "_c10a426a _dcc36159 _pub-dcc36159 _pub-1b5d7030",
            zoom: props["zoom"],
          },
          null
        ),
      props["showEmpty"] &&
        React.createElement(
          _pub1D925283_PreviewEmpty,
          {
            class: "_d811732b _dcc36159 _pub-dcc36159 _pub-1b5d7030",
          },
          null
        ),
      props["showCanvas"] &&
        React.createElement(
          React.Fragment,
          {},
          React.createElement(
            Center,
            {
              class: "_eae3d2ac",
            },
            props["showQuickfind"] &&
              React.createElement(
                _pubB7C93A9_Preview,
                {
                  class: "_6c24ba4f _dcc36159 _pub-dcc36159 _pub-1b5d7030",
                },
                null
              ),
            React.createElement(
              _pub9A1D806_Preview,
              {
                class: "_5a42e2d4 _dcc36159 _pub-dcc36159 _pub-1b5d7030",
              },
              null
            ),
            React.createElement(
              _pub9F0B6Cab_Preview,
              {
                class: "_c34bb36e _dcc36159 _pub-dcc36159 _pub-1b5d7030",
              },
              null
            )
          ),
          React.createElement(
            _pub3037Cf6A_Preview,
            {
              class: "_9de4e23a _dcc36159 _pub-dcc36159 _pub-1b5d7030",
              showComputed: props["showComputed"],
            },
            null
          )
        ),
      props["showMedia"] &&
        React.createElement(
          React.Fragment,
          {},
          React.createElement(
            _pub4Bf59013_Preview,
            {
              class: "_525fb5c9 _dcc36159 _pub-dcc36159 _pub-1b5d7030",
            },
            null
          )
        ),
      props["showNoPreview"] &&
        React.createElement(
          React.Fragment,
          {},
          React.createElement(
            NoPreview,
            {
              class: "_cf888d70",
            },
            null
          )
        )
    );
  })
);

var DesignModeResizer = React.memo(
  React.forwardRef(function DesignModeResizer(props, ref) {
    return React.createElement(
      _pub125B0661_Container,
      {
        class:
          "_87049ecb _dcc36159 _pub-dcc36159 _pub-1b5d7030" +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
        style: castStyle(props["style"]),
      },
      props["children"]
    );
  })
);
export { DesignModeResizer };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      DesignModeResizer,
      {
        class: "_690affe7",
        ref: ref,
      },
      React.createElement(
        Container,
        {
          class: "_c10ab86",
          float: props["float"],
        },
        props["v2"] &&
          React.createElement(
            _pub11C5A67F_Preview,
            {
              class: "_83b71886 _dcc36159 _pub-dcc36159 _pub-1b5d7030",
              showGrid: props["showGrid"],
              showEnvPopup: props["showEnvPopup"],
            },
            null
          ),
        !props["v2"] &&
          React.createElement(
            _pub7E7D388E_Preview,
            {
              class: "_9aac29c7 _dcc36159 _pub-dcc36159 _pub-1b5d7030",
              gridMode: true,
              showEnvPopup: props["showEnvPopup"],
            },
            null
          ),
        React.createElement(
          CanvasContainerPreview,
          {
            class: "_85f9502d",
            showCanvas: props["showCanvas"],
            showLeftSidebar: props["showLeftSidebar"],
            showMedia: props["showMedia"],
            showNoPreview: props["showNoPreview"],
            showEmpty: props["showEmpty"],
            showGrid: props["showGrid"],
            showQuickfind: props["showQuickfind"],
            showComputed: props["showComputed"],
          },
          null
        )
      )
    );
  })
);
export { Preview };
