import React from "react";
import _pubD9B10930 from "./colors.pc";
import _pub62Dca9E0 from "./typography.pc";
import _pub9938313, {
  Container as _pub9938313_Container,
  Row as _pub9938313_Row,
} from "./layout.pc";
import _pub2492Cc10, { Anchor as _pub2492Cc10_Anchor } from "./button.pc";
import _pub9F273410, { Icon as _pub9F273410_Icon } from "./icons/icons.pc";
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

export const classNames = {
  _emoji: "_pub-55ee47a8__emoji",
};

var Highlight = React.memo(
  React.forwardRef(function Highlight(props, ref) {
    return React.createElement(
      "span",
      {
        className:
          "_81e04aad _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__highlight _pub-55ee47a8__highlight _highlight" +
          (props["noBreak"]
            ? " " + "_55ee47a8_noBreak _pub-55ee47a8_noBreak noBreak"
            : "") +
          (props["darker"]
            ? " " + "_55ee47a8_darker _pub-55ee47a8_darker darker"
            : "") +
          (props["bold"] ? " " + "_55ee47a8_bold _pub-55ee47a8_bold bold" : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Highlight };

var Home = React.memo(
  React.forwardRef(function Home(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_8dff5b77 _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__home _pub-55ee47a8__home _home " +
          " " +
          "_62dca9e0_text-default _pub-62dca9e0_text-default text-default",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Home };

var Header = React.memo(
  React.forwardRef(function Header(props, ref) {
    return React.createElement(
      _pub9938313_Container,
      {
        class:
          "_63f13a5b _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__header _pub-55ee47a8__header _header" +
          " " +
          " " +
          " " +
          "_55ee47a8__main _pub-55ee47a8__main _main",
        ref: ref,
      },
      React.createElement(
        _pub9938313_Row,
        {
          class: "_af6e76f6 _55ee47a8 _pub-55ee47a8",
        },
        React.createElement(
          "div",
          {
            className: "_cbad7576 _55ee47a8 _pub-55ee47a8",
          },
          React.createElement(
            "div",
            {
              className:
                "_6927d844 _55ee47a8 _pub-55ee47a8" +
                " " +
                "_55ee47a8__title _pub-55ee47a8__title _title",
            },
            props["title"]
          ),
          React.createElement(
            "div",
            {
              className:
                "_f02e89fe _55ee47a8 _pub-55ee47a8" +
                " " +
                "_55ee47a8__subtext _pub-55ee47a8__subtext _subtext",
            },
            props["description"]
          ),
          React.createElement(
            "div",
            {
              className:
                "_8729b968 _55ee47a8 _pub-55ee47a8" +
                " " +
                "_55ee47a8__cta _pub-55ee47a8__cta _cta",
            },
            props["cta"]
          )
        )
      ),
      React.createElement(
        _pub9938313_Row,
        {
          class: "_3667274c _55ee47a8 _pub-55ee47a8",
        },
        React.createElement(
          "div",
          {
            className:
              "_beecfbb9 _55ee47a8 _pub-55ee47a8" +
              " " +
              "_55ee47a8__preview _pub-55ee47a8__preview _preview",
          },
          props["preview"]
        )
      )
    );
  })
);
export { Header };

var CodePreview = React.memo(
  React.forwardRef(function CodePreview(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_8a929f6e _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__code-preview _pub-55ee47a8__code-preview _code-preview",
        ref: ref,
      },
      null
    );
  })
);

var Summary = React.memo(
  React.forwardRef(function Summary(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_649cfe42 _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__summary _pub-55ee47a8__summary _summary " +
          " " +
          "_9938313__row _pub-9938313__row _row",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_a867de2a _55ee47a8 _pub-55ee47a8" +
            " " +
            "_9938313__col12 _pub-9938313__col12 _col12",
        },
        React.createElement(
          "div",
          {
            className:
              "_492ae320 _55ee47a8 _pub-55ee47a8" +
              " " +
              "_55ee47a8__title _pub-55ee47a8__title _title",
          },
          props["title"]
        ),
        React.createElement(
          "div",
          {
            className:
              "_3e2dd3b6 _55ee47a8 _pub-55ee47a8" +
              " " +
              "_55ee47a8__text _pub-55ee47a8__text _text",
          },
          props["text"]
        )
      )
    );
  })
);
export { Summary };

var MainFeatures = React.memo(
  React.forwardRef(function MainFeatures(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_8324d345 _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__main-features _pub-55ee47a8__main-features _main-features " +
          " " +
          "_9938313__row _pub-9938313__row _row",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { MainFeatures };

var MainFeatureItem = React.memo(
  React.forwardRef(function MainFeatureItem(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_a6d208b4 _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__item _pub-55ee47a8__item _item " +
          " " +
          "_9938313__col _pub-9938313__col _col" +
          " " +
          " " +
          " " +
          "_9938313__col6 _pub-9938313__col6 _col6",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_be5f0d76 _55ee47a8 _pub-55ee47a8" +
            " " +
            "_55ee47a8__heading _pub-55ee47a8__heading _heading",
        },
        React.createElement(
          _pub9F273410_Icon,
          {
            class:
              "_37f954b8 _55ee47a8 _pub-55ee47a8" +
              " " +
              "_55ee47a8__icon _pub-55ee47a8__icon _icon",
            name: props["iconName"],
          },
          null
        ),
        React.createElement(
          "div",
          {
            className:
              "_aef00502 _55ee47a8 _pub-55ee47a8" +
              " " +
              "_55ee47a8__info _pub-55ee47a8__info _info",
          },
          React.createElement(
            "div",
            {
              className:
                "_727170d7 _55ee47a8 _pub-55ee47a8" +
                " " +
                "_55ee47a8__title _pub-55ee47a8__title _title",
            },
            React.createElement(
              "span",
              {
                className: "_ae5118bf _55ee47a8 _pub-55ee47a8",
              },
              props["title"]
            )
          ),
          React.createElement(
            "div",
            {
              className:
                "_eb78216d _55ee47a8 _pub-55ee47a8" +
                " " +
                "_55ee47a8__details _pub-55ee47a8__details _details",
            },
            props["description"]
          )
        )
      ),
      React.createElement(
        "div",
        {
          className:
            "_27565ccc _55ee47a8 _pub-55ee47a8" +
            " " +
            "_55ee47a8__example _pub-55ee47a8__example _example",
        },
        props["example"]
      )
    );
  })
);
export { MainFeatureItem };

var VariousFeatures = React.memo(
  React.forwardRef(function VariousFeatures(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_48dc6998 _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__various-features _pub-55ee47a8__various-features _various-features " +
          " " +
          "_9938313__row _pub-9938313__row _row",
        ref: ref,
      },
      props["children"]
    );
  })
);
export { VariousFeatures };

var VariousFeatureItem = React.memo(
  React.forwardRef(function VariousFeatureItem(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_a1bfccad _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__item _pub-55ee47a8__item _item " +
          " " +
          "_9938313__col _pub-9938313__col _col" +
          " " +
          " " +
          " " +
          "_9938313__col3 _pub-9938313__col3 _col3",
        ref: ref,
      },
      React.createElement(
        _pub9F273410_Icon,
        {
          class:
            "_b956a5aa _55ee47a8 _pub-55ee47a8" +
            " " +
            "_55ee47a8__icon _pub-55ee47a8__icon _icon",
          name: props["iconName"],
        },
        null
      ),
      React.createElement(
        "div",
        {
          className:
            "_205ff410 _55ee47a8 _pub-55ee47a8" +
            " " +
            "_55ee47a8__info _pub-55ee47a8__info _info",
        },
        React.createElement(
          "div",
          {
            className:
              "_b7387cb7 _55ee47a8 _pub-55ee47a8" +
              " " +
              "_55ee47a8__title _pub-55ee47a8__title _title",
          },
          React.createElement(
            "span",
            {
              className: "_c21afa7a _55ee47a8 _pub-55ee47a8",
            },
            props["title"]
          )
        ),
        React.createElement(
          "div",
          {
            className:
              "_c03f4c21 _55ee47a8 _pub-55ee47a8" +
              " " +
              "_55ee47a8__details _pub-55ee47a8__details _details",
          },
          props["description"]
        )
      )
    );
  })
);
export { VariousFeatureItem };

var BigFeature = React.memo(
  React.forwardRef(function BigFeature(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_4fb1ad81 _55ee47a8 _pub-55ee47a8" +
          " " +
          "_55ee47a8__big-feature _pub-55ee47a8__big-feature _big-feature " +
          " " +
          "_9938313__section _pub-9938313__section _section" +
          " " +
          " " +
          " " +
          "_9938313__row _pub-9938313__row _row",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_bad271c4 _55ee47a8 _pub-55ee47a8" +
            " " +
            "_9938313__col _pub-9938313__col _col" +
            " " +
            " " +
            " " +
            "_9938313__col3 _pub-9938313__col3 _col3",
        },
        React.createElement(
          "div",
          {
            className:
              "_21b0f0a2 _55ee47a8 _pub-55ee47a8" +
              " " +
              "_55ee47a8__info _pub-55ee47a8__info _info",
          },
          React.createElement(
            "div",
            {
              className:
                "_66a6757b _55ee47a8 _pub-55ee47a8" +
                " " +
                "_55ee47a8__title _pub-55ee47a8__title _title",
            },
            props["title"]
          ),
          React.createElement(
            "div",
            {
              className:
                "_11a145ed _55ee47a8 _pub-55ee47a8" +
                " " +
                "_55ee47a8__details _pub-55ee47a8__details _details",
            },
            props["description"]
          ),
          React.createElement(
            "a",
            {
              className:
                "_88a81457 _55ee47a8 _pub-55ee47a8" +
                " " +
                "_55ee47a8__mini-cta-link _pub-55ee47a8__mini-cta-link _mini-cta-link",
              href: props["ctaHref"],
            },
            props["ctaText"],
            React.createElement(
              _pub9F273410_Icon,
              {
                class:
                  "_46048ed6 _55ee47a8 _pub-55ee47a8" +
                  " " +
                  "_55ee47a8__mini-cta-icon _pub-55ee47a8__mini-cta-icon _mini-cta-icon",
                name: "chevron-right",
              },
              null
            )
          )
        )
      ),
      React.createElement(
        "div",
        {
          className:
            "_23db207e _55ee47a8 _pub-55ee47a8" +
            " " +
            "_55ee47a8__preview _pub-55ee47a8__preview _preview",
        },
        props["preview"]
      )
    );
  })
);
export { BigFeature };

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      Home,
      {
        class: "_a8098086",
        ref: ref,
      },
      React.createElement(
        Header,
        {
          class: "_c74b6c58",
          title: React.createElement(
            React.Fragment,
            {},
            "\n      A hybrid approach to building web applications.\n    "
          ),
          description: React.createElement(
            React.Fragment,
            {},
            "\n      Realtime previews, visual regression testing, and more. Paperclip is a\n      template language that comes with tooling to help you build UIs more\n      quickly & safely.\n    "
          ),
          cta: React.createElement(
            React.Fragment,
            {},
            React.createElement(
              _pub2492Cc10_Anchor,
              {
                class:
                  "_94b441d3 _55ee47a8 _pub-55ee47a8" +
                  " " +
                  "_62dca9e0_semi-bold _pub-62dca9e0_semi-bold semi-bold",
                strong: true,
              },
              "\n        Sign up for early access\n      "
            )
          ),
          preview: React.createElement(
            "video",
            {
              className: "_8a51c31 _55ee47a8 _pub-55ee47a8",
              src: "../../static/vid/paperclip-fast-demo.mp4",
              autoplay: true,
              loop: true,
            },
            null
          ),
        },
        null
      ),
      React.createElement(
        MainFeatures,
        {
          class: "_29450d74",
        },
        React.createElement(
          MainFeatureItem,
          {
            class: "_72c891b6",
            iconName: "shapes",
            title: "A minimalistic template language",
            description:
              "Paperclip only covers basic HTML & CSS that can be written to cover primitive UI components which can then be imported directly into your app.",
            example: React.createElement(
              CodePreview,
              {
                class: "_4fa250b3",
              },
              null
            ),
          },
          null
        ),
        React.createElement(
          MainFeatureItem,
          {
            class: "_5cfa120",
            iconName: "reactjs",
            title: "Compiles plain, efficient code",
            description: "Paperclip templates ",
            example: React.createElement(
              CodePreview,
              {
                class: "_56b961f2",
              },
              null
            ),
          },
          null
        )
      ),
      React.createElement(
        MainFeatures,
        {
          class: "_5e423de2",
        },
        React.createElement(
          MainFeatureItem,
          {
            class: "_730afb81",
            iconName: "chaotic-1",
            title: "Keep CSS under control",
            description:
              "There is no global CSS in Paperclip. Instead, Paperclip has syntax that allows you to explicitly reference styles from other files, so you don't have to worry about leaky CSS.",
            example: React.createElement(
              CodePreview,
              {
                class: "_f71e37d6",
              },
              null
            ),
          },
          null
        ),
        React.createElement(
          MainFeatureItem,
          {
            class: "_40dcb17",
            iconName: "reactjs",
            title: "Works with third-party CSS",
            description: "Kee ",
            example: React.createElement(
              CodePreview,
              {
                class: "_ee050697",
              },
              null
            ),
          },
          null
        )
      ),
      React.createElement(
        VariousFeatures,
        {
          class: "_c026a841",
        },
        React.createElement(
          VariousFeatureItem,
          {
            class: "_7645ed04",
            iconName: "chaotic-1",
            title: "Keep CSS under control",
            description:
              "There is no global CSS in Paperclip. Instead, you explicitly",
          },
          null
        ),
        React.createElement(
          VariousFeatureItem,
          {
            class: "_142dd92",
            iconName: "link",
            title: "Strongly typed",
            description:
              "UIs compile to strongly typed code, so worry less about breaking changes.",
          },
          null
        ),
        React.createElement(
          VariousFeatureItem,
          {
            class: "_984b8c28",
            iconName: "grow",
            title: "Incrementally adoptable",
            description:
              "Paperclip compliments your existing codebase, so use it as you go.",
          },
          null
        )
      ),
      React.createElement(
        BigFeature,
        {
          class: "_b72198d7",
          title: "IDE integration",
          description:
            "Realtime previews, intellisense, and other tools make up the VS Code extension to help you build UIs faster.",
          preview: React.createElement(
            "img",
            {
              className: "_2d5d8e2 _55ee47a8 _pub-55ee47a8",
              src: "./assets/realtime-editing-2.gif",
            },
            null
          ),
          ctaText: "View the extension",
        },
        null
      ),
      React.createElement(
        BigFeature,
        {
          class: "_2e28c96d",
          title: "Never miss a CSS Bug",
          description:
            "Use the visual regression tool to catch every visual state of your UI. No more broken window CSS. 🎉",
          preview: React.createElement(
            "img",
            {
              className: "_29f88b21 _55ee47a8 _pub-55ee47a8",
              src: "./assets/realtime-editing-2.gif",
            },
            null
          ),
          ctaText: "View the API",
        },
        null
      )
    );
  })
);
