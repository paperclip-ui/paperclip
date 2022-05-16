import React from "react";
import _pubD9B10930 from "./colors.pc";
import _pub62Dca9E0 from "./typography.pc";
import _pub9938313, { Container as _pub9938313_Container } from "./layout.pc";
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
  _emoji: "_pub-52327d9f__emoji",
};

var Home = React.memo(
  React.forwardRef(function Home(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_2247238 _52327d9f _pub-52327d9f _pub-9938313" +
          " " +
          "_52327d9f__home _pub-52327d9f__home _pub-9938313__home _home " +
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
        class: "_d19f884 _52327d9f _pub-52327d9f _pub-9938313",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_dca46252 _52327d9f _pub-52327d9f _pub-9938313",
        },
        React.createElement(
          "div",
          {
            className: "_1b1cab2c _52327d9f _pub-52327d9f _pub-9938313",
            "data-pc-label": "Info",
          },
          React.createElement(
            "div",
            {
              className: "_481842f8 _52327d9f _pub-52327d9f _pub-9938313",
            },
            React.createElement(
              "div",
              {
                className: "_749a4b3b _52327d9f _pub-52327d9f _pub-9938313",
              },
              props["title"]
            ),
            React.createElement(
              "div",
              {
                className: "_ed931a81 _52327d9f _pub-52327d9f _pub-9938313",
              },
              props["description"]
            ),
            React.createElement(
              "div",
              {
                className:
                  "_9a942a17 _52327d9f _pub-52327d9f _pub-9938313" +
                  " " +
                  "_52327d9f__cta _pub-52327d9f__cta _pub-9938313__cta _cta",
              },
              props["cta"]
            )
          ),
          props["preview"]
        )
      )
    );
  })
);
export { Header };

var HeaderExamples = React.memo(
  React.forwardRef(function HeaderExamples(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_e31799a8 _52327d9f _pub-52327d9f _pub-9938313",
        ref: ref,
      },
      props["left"],
      React.createElement(
        "img",
        {
          className: "_4629e786 _52327d9f _pub-52327d9f _pub-9938313",
          src: "./assets/import-graphic-2.svg",
        },
        null
      ),
      props["right"]
    );
  })
);
export { HeaderExamples };

var CodePreview = React.memo(
  React.forwardRef(function CodePreview(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_a743c9d _52327d9f _pub-52327d9f _pub-9938313" +
          " " +
          "_52327d9f__code-preview _pub-52327d9f__code-preview _pub-9938313__code-preview _code-preview",
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
          "_e47a5db1 _52327d9f _pub-52327d9f _pub-9938313" +
          " " +
          "_52327d9f__summary _pub-52327d9f__summary _pub-9938313__summary _summary " +
          " " +
          "_9938313__row _pub-9938313__row _row",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_d8291ee0 _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_9938313__col12 _pub-9938313__col12 _col12",
        },
        React.createElement(
          "div",
          {
            className:
              "_e35b6e1a _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__title _pub-52327d9f__title _pub-9938313__title _title",
          },
          props["title"]
        ),
        React.createElement(
          "div",
          {
            className:
              "_945c5e8c _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__text _pub-52327d9f__text _pub-9938313__text _text",
          },
          props["text"]
        )
      )
    );
  })
);
export { Summary };

var CTABottom = React.memo(
  React.forwardRef(function CTABottom(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_3c270b6 _52327d9f _pub-52327d9f _pub-9938313",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_d2b733ea _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_52327d9f__row _pub-52327d9f__row _pub-9938313__row _row",
        },
        React.createElement(
          _pub9F273410_Icon,
          {
            class:
              "_b265b157 _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__icon _pub-52327d9f__icon _pub-9938313__icon _icon",
            name: "grow",
          },
          null
        ),
        React.createElement(
          "div",
          {
            className: "_c56281c1 _52327d9f _pub-52327d9f _pub-9938313",
          },
          React.createElement(
            "div",
            {
              className:
                "_7873d8f1 _52327d9f _pub-52327d9f _pub-9938313" +
                " " +
                "_52327d9f__title _pub-52327d9f__title _pub-9938313__title _title",
            },
            props["title"]
          ),
          React.createElement(
            "div",
            {
              className:
                "_e17a894b _52327d9f _pub-52327d9f _pub-9938313" +
                " " +
                "_52327d9f__text _pub-52327d9f__text _pub-9938313__text _text",
            },
            props["description"]
          ),
          React.createElement(
            "div",
            {
              className: "_967db9dd _52327d9f _pub-52327d9f _pub-9938313",
            },
            props["actions"]
          )
        )
      )
    );
  })
);
export { CTABottom };

var CTAInstall = React.memo(
  React.forwardRef(function CTAInstall(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_2634ab47 _52327d9f _pub-52327d9f _pub-9938313",
        ref: ref,
      },
      React.createElement(
        "span",
        {
          className: "_ce11cdbc _52327d9f _pub-52327d9f _pub-9938313",
        },
        props["label"]
      ),
      React.createElement(
        "div",
        {
          className: "_57189c06 _52327d9f _pub-52327d9f _pub-9938313",
        },
        props["children"]
      )
    );
  })
);
export { CTAInstall };

var MainFeatures = React.memo(
  React.forwardRef(function MainFeatures(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_c83aca6b _52327d9f _pub-52327d9f _pub-9938313" +
          " " +
          "_52327d9f__main-features _pub-52327d9f__main-features _pub-9938313__main-features _main-features " +
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
          "_21596f5e _52327d9f _pub-52327d9f _pub-9938313" +
          " " +
          "_52327d9f__item _pub-52327d9f__item _pub-9938313__item _item " +
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
            "_c9186560 _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_52327d9f__heading _pub-52327d9f__heading _pub-9938313__heading _heading",
        },
        React.createElement(
          _pub9F273410_Icon,
          {
            class:
              "_68087f42 _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__icon _pub-52327d9f__icon _pub-9938313__icon _icon",
            name: props["iconName"],
          },
          null
        ),
        React.createElement(
          "div",
          {
            className:
              "_f1012ef8 _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__info _pub-52327d9f__info _pub-9938313__info _info",
          },
          React.createElement(
            "div",
            {
              className:
                "_309edf51 _52327d9f _pub-52327d9f _pub-9938313" +
                " " +
                "_52327d9f__title _pub-52327d9f__title _pub-9938313__title _title",
            },
            React.createElement(
              "span",
              {
                className: "_85e1dbe4 _52327d9f _pub-52327d9f _pub-9938313",
              },
              props["title"]
            )
          ),
          React.createElement(
            "div",
            {
              className:
                "_a9978eeb _52327d9f _pub-52327d9f _pub-9938313" +
                " " +
                "_52327d9f__details _pub-52327d9f__details _pub-9938313__details _details",
            },
            props["description"]
          )
        )
      ),
      React.createElement(
        "div",
        {
          className:
            "_501134da _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_52327d9f__example _pub-52327d9f__example _pub-9938313__example _example",
        },
        props["example"]
      )
    );
  })
);
export { MainFeatureItem };

var HeaderFeatureItem = React.memo(
  React.forwardRef(function HeaderFeatureItem(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_cf570e72 _52327d9f _pub-52327d9f _pub-9938313",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_ca9cb10e _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_52327d9f__heading _pub-52327d9f__heading _pub-9938313__heading _heading",
        },
        React.createElement(
          _pub9F273410_Icon,
          {
            class:
              "_12c82c22 _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__icon _pub-52327d9f__icon _pub-9938313__icon _icon",
            name: props["iconName"],
          },
          null
        ),
        React.createElement(
          "div",
          {
            className:
              "_8bc17d98 _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__info _pub-52327d9f__info _pub-9938313__info _info",
          },
          React.createElement(
            "div",
            {
              className:
                "_a701ce78 _52327d9f _pub-52327d9f _pub-9938313" +
                " " +
                "_52327d9f__title _pub-52327d9f__title _pub-9938313__title _title",
            },
            React.createElement(
              "span",
              {
                className: "_ab17f362 _52327d9f _pub-52327d9f _pub-9938313",
              },
              props["title"]
            )
          ),
          React.createElement(
            "div",
            {
              className:
                "_3e089fc2 _52327d9f _pub-52327d9f _pub-9938313" +
                " " +
                "_52327d9f__details _pub-52327d9f__details _pub-9938313__details _details",
            },
            props["description"]
          )
        )
      ),
      React.createElement(
        "div",
        {
          className:
            "_5395e0b4 _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_52327d9f__example _pub-52327d9f__example _pub-9938313__example _example",
        },
        props["example"]
      )
    );
  })
);
export { HeaderFeatureItem };

var VariousFeatures = React.memo(
  React.forwardRef(function VariousFeatures(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_28ef2375 _52327d9f _pub-52327d9f _pub-9938313" +
          " " +
          "_52327d9f__various-features _pub-52327d9f__various-features _pub-9938313__various-features _various-features " +
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
          "_3f2f9a06 _52327d9f _pub-52327d9f _pub-9938313" +
          " " +
          "_52327d9f__item _pub-52327d9f__item _pub-9938313__item _item " +
          " " +
          "_9938313__col _pub-9938313__col _col" +
          " " +
          " " +
          " " +
          "_9938313__col4 _pub-9938313__col4 _col4",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_76adaad9 _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_52327d9f__info _pub-52327d9f__info _pub-9938313__info _info",
        },
        React.createElement(
          "div",
          {
            className:
              "_21d33ab1 _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__title _pub-52327d9f__title _pub-9938313__title _title",
          },
          React.createElement(
            _pub9F273410_Icon,
            {
              class:
                "_bff2fb2 _52327d9f _pub-52327d9f _pub-9938313" +
                " " +
                "_52327d9f__icon _pub-52327d9f__icon _pub-9938313__icon _icon",
              name: props["iconName"],
            },
            null
          ),
          React.createElement(
            "span",
            {
              className: "_92f67e08 _52327d9f _pub-52327d9f _pub-9938313",
            },
            props["title"]
          )
        ),
        React.createElement(
          "div",
          {
            className:
              "_56d40a27 _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__details _pub-52327d9f__details _pub-9938313__details _details",
          },
          props["description"]
        )
      )
    );
  })
);
export { VariousFeatureItem };

var SuperBigFeature = React.memo(
  React.forwardRef(function SuperBigFeature(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_d121fb2a _52327d9f _pub-52327d9f _pub-9938313" +
          " " +
          "_52327d9f_layout _pub-52327d9f_layout _pub-9938313_layout layout" +
          " " +
          " _pub-9938313__row _52327d9f__row _pub-52327d9f__row _pub-9938313__row _row",
        ref: ref,
      },
      React.createElement(
        Info,
        {
          class: "_75297eb7",
          title: props["title"],
          description: props["description"],
          big: true,
          center: true,
        },
        null
      ),
      React.createElement(
        FeaturePreview,
        {
          class: "_ec202f0d",
        },
        props["preview"]
      )
    );
  })
);
export { SuperBigFeature };

var FeaturePreview = React.memo(
  React.forwardRef(function FeaturePreview(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_38425e1f _52327d9f _pub-52327d9f _pub-9938313" +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);

var BigFeature = React.memo(
  React.forwardRef(function BigFeature(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_d64c3f33 _52327d9f _pub-52327d9f _pub-9938313" +
          " " +
          "_52327d9f__big-feature _pub-52327d9f__big-feature _pub-9938313__big-feature _big-feature _52327d9f__section _pub-52327d9f__section _pub-9938313__section _section _52327d9f__row _pub-52327d9f__row _pub-9938313__row _row" +
          (props["noShadow"]
            ? " " +
              "_52327d9f_no-shadow _pub-52327d9f_no-shadow _pub-9938313_no-shadow no-shadow"
            : "") +
          (props["smallerPreview"]
            ? " " +
              "_52327d9f_smaller-preview _pub-52327d9f_smaller-preview _pub-9938313_smaller-preview smaller-preview"
            : "") +
          (props["ctaText"]
            ? " " +
              "_52327d9f_has_cta _pub-52327d9f_has_cta _pub-9938313_has_cta has_cta"
            : ""),
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_7220d66b _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_52327d9f__col _pub-52327d9f__col _pub-9938313__col _col _52327d9f__col4 _pub-52327d9f__col4 _pub-9938313__col4 _col4",
        },
        React.createElement(
          _pub9F273410_Icon,
          {
            class:
              "_409dae3d _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_52327d9f__icon _pub-52327d9f__icon _pub-9938313__icon _icon",
            name: "grow",
          },
          null
        ),
        React.createElement(
          Info,
          {
            class: "_379a9eab",
            title: props["title"],
            description: props["description"],
            ctaHref: props["ctaHref"],
            ctaText: props["ctaText"],
          },
          null
        )
      ),
      React.createElement(
        FeaturePreview,
        {
          class:
            "_eb2987d1" +
            " " +
            "_52327d9f_layout _pub-52327d9f_layout _pub-9938313_layout layout" +
            " " +
            " _col _col8",
        },
        props["preview"]
      )
    );
  })
);
export { BigFeature };

var Info = React.memo(
  React.forwardRef(function Info(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_31f41234 _52327d9f _pub-52327d9f _pub-9938313" +
          (props["big"]
            ? " " + "_52327d9f_big _pub-52327d9f_big _pub-9938313_big big"
            : "") +
          (props["center"]
            ? " " +
              "_52327d9f_center _pub-52327d9f_center _pub-9938313_center center"
            : ""),
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className:
            "_78befb61 _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_52327d9f__title _pub-52327d9f__title _pub-9938313__title _title",
        },
        props["title"]
      ),
      React.createElement(
        "div",
        {
          className: "_e1b7aadb _52327d9f _pub-52327d9f _pub-9938313",
        },
        props["description"]
      ),
      React.createElement(
        "a",
        {
          className:
            "_96b09a4d _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_52327d9f__mini-cta-link _pub-52327d9f__mini-cta-link _pub-9938313__mini-cta-link _mini-cta-link",
          href: props["ctaHref"],
        },
        props["ctaText"],
        React.createElement(
          _pub9F273410_Icon,
          {
            class: "_fc29c432 _52327d9f _pub-52327d9f _pub-9938313",
            name: "chevron-right",
          },
          null
        )
      )
    );
  })
);

var Preview = React.memo(
  React.forwardRef(function Preview(props, ref) {
    return React.createElement(
      Home,
      {
        class: "_706e0cc1",
        ref: ref,
      },
      React.createElement(
        Header,
        {
          class: "_eb7a9260",
          title: React.createElement(
            React.Fragment,
            {},
            "\n      Paperclip is a ",
            React.createElement(
              "strong",
              {
                className: "_11aedd26 _52327d9f _pub-52327d9f _pub-9938313",
              },
              "\n        generic approach that brings scoped CSS to any kind of web application\n      "
            )
          ),
          description: React.createElement(
            React.Fragment,
            {},
            "\n      Paperclip is a tiny language that allows you to define primitive HTML &\n      CSS components for web applications at any scale.\n    "
          ),
          cta: React.createElement(
            React.Fragment,
            {},
            React.createElement(
              _pub2492Cc10_Anchor,
              {
                class:
                  "_122a0948 _52327d9f _pub-52327d9f _pub-9938313" +
                  " " +
                  "_62dca9e0_semi-bold _pub-62dca9e0_semi-bold semi-bold",
                strong: true,
              },
              "\n        Sign up for early access\n      "
            )
          ),
          preview: React.createElement(
            HeaderExamples,
            {
              class: "_208b9551",
              left: React.createElement(
                CodePreview,
                {
                  class: "_e89735d6",
                },
                null
              ),
              right: React.createElement(
                CodePreview,
                {
                  class: "_9f900540",
                },
                null
              ),
            },
            null
          ),
        },
        null
      ),
      React.createElement(
        Summary,
        {
          class: "_7273c3da",
          title: "Writing bug-free HTML & CSS is hard",
          text: "Paperclip is a generic solution for all languages that gives you additional ",
        },
        null
      ),
      React.createElement(
        MainFeatures,
        {
          class: "_574f34c",
        },
        React.createElement(
          MainFeatureItem,
          {
            class: "_3f52de67",
            iconName: "shapes",
            title: "Paperclip covers re-usable primitives",
            description:
              "Paperclip allows you to use basic HTML & CSS to define primitive components that you can re-use in your app.",
            example: React.createElement(
              CodePreview,
              {
                class: "_be3b28be",
              },
              null
            ),
          },
          null
        ),
        React.createElement(
          MainFeatureItem,
          {
            class: "_4855eef1",
            iconName: "reactjs",
            title: "Import directly into React code",
            description:
              "Paperclip documents compile to plain code that you can import directly into your code.",
            example: React.createElement(
              CodePreview,
              {
                class: "_a72019ff",
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
          class: "_9b1066ef",
        },
        React.createElement(
          VariousFeatureItem,
          {
            class: "_3a1dc8e2",
            iconName: "chaotic-1",
            title: "Scoped CSS",
            description:
              "CSS styles are explicitly referenced within Paperclip, so you don't have to have to worry about styles leaking out.",
          },
          null
        ),
        React.createElement(
          VariousFeatureItem,
          {
            class: "_4d1af874",
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
            class: "_d413a9ce",
            iconName: "grow",
            title: "Works with your existing codebase",
            description:
              "Paperclip compliments your existing codebase, so use it as you go.",
          },
          null
        )
      ),
      React.createElement(
        SuperBigFeature,
        {
          class: "_ec175679",
          title: "Live editing",
          ctaText: "Learn about visual regression testing",
          description:
            "Paperclip gives you an explicit syntax over CSS, so you have total control over your styles, including third-party CSS. With Paperclip o you know exactly how they're used in your application. No more worrying about CSS frameworks accidentally overriding styles. ",
          preview: React.createElement(
            "video",
            {
              className: "_44e75055 _52327d9f _pub-52327d9f _pub-9938313",
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
        BigFeature,
        {
          class: "_751e07c3",
          title: "Never miss a CSS Bug",
          description:
            "Use the visual regression tool to catch every visual state of your UI. Feel more confident about maintaining your styles.",
          preview: React.createElement(
            "video",
            {
              className: "_18cd3300 _52327d9f _pub-52327d9f _pub-9938313",
              src: "../../static/vid/visual-regression-testing.mp4",
              autoplay: true,
              loop: true,
            },
            null
          ),
          ctaText: "View the API",
        },
        null
      ),
      React.createElement(
        CTABottom,
        {
          class: "_2193755",
          title: "Easy to set up",
          description: React.createElement(
            React.Fragment,
            {},
            "\n      Paperclip currently supports ",
            React.createElement(
              "strong",
              {
                className: "_3507e8cd _52327d9f _pub-52327d9f _pub-9938313",
              },
              "React"
            ),
            " and ",
            React.createElement(
              "strong",
              {
                className: "_db0989e1 _52327d9f _pub-52327d9f _pub-9938313",
              },
              "\n        static HTML\n      "
            ),
            " out of the box. Want to try it out? Just check out the ",
            React.createElement(
              "a",
              {
                className: "_326a2cd4 _52327d9f _pub-52327d9f _pub-9938313",
                href: "/repl",
              },
              "\n        playground\n      "
            ),
            ", or run one of the following commands in your existing codebase. You\n      can easily opt-out whenever you want.\n    "
          ),
          actions: React.createElement(
            React.Fragment,
            {},
            React.createElement(
              CTAInstall,
              {
                class: "_40466602",
                label: "NPX",
              },
              "npx @paperclip-ui/cli init"
            ),
            React.createElement(
              CTAInstall,
              {
                class: "_37415694",
                label: "Yarn",
              },
              "\n        yarn add @paperclip-ui/cli --dev && yarn paperclip init\n      "
            )
          ),
        },
        null
      ),
      React.createElement(
        "div",
        {
          className:
            "_92a62ac4 _52327d9f _pub-52327d9f _pub-9938313" +
            " " +
            "_9938313__row _pub-9938313__row _row",
        },
        React.createElement(
          "div",
          {
            className: "_44000110 _52327d9f _pub-52327d9f _pub-9938313",
          },
          "\n      Easy setup\n    "
        ),
        React.createElement(
          "div",
          {
            className: "_dd0950aa _52327d9f _pub-52327d9f _pub-9938313",
          },
          "\n      Paperclip currently supports ",
          React.createElement(
            "strong",
            {
              className: "_96a7c10e _52327d9f _pub-52327d9f _pub-9938313",
            },
            "React"
          ),
          " and ",
          React.createElement(
            "strong",
            {
              className: "_7fc4643b _52327d9f _pub-52327d9f _pub-9938313",
            },
            "\n        static HTML\n      "
          ),
          " out of the box. Want to try it out? Just check out the ",
          React.createElement(
            "a",
            {
              className: "_91ca0517 _52327d9f _pub-52327d9f _pub-9938313",
              href: "/repl",
            },
            "\n        playground\n      "
          ),
          ", or run one of the following commands in your existing codebase. You\n      can easily opt-out whenever you want.\n    "
        ),
        React.createElement(
          "div",
          {
            className: "_346af59f _52327d9f _pub-52327d9f _pub-9938313",
          },
          React.createElement(
            "div",
            {
              className: "_b23ec06 _52327d9f _pub-52327d9f _pub-9938313",
            },
            "\n        Via NPX:\n        ",
            React.createElement(
              "div",
              {
                className: "_cfcb4adc _52327d9f _pub-52327d9f _pub-9938313",
              },
              "\n          npx @paperclip/cli init\n        "
            )
          ),
          React.createElement(
            "div",
            {
              className: "_922abdbc _52327d9f _pub-52327d9f _pub-9938313",
            },
            "\n        Via Yarn:\n        ",
            React.createElement(
              "div",
              {
                className: "_cd8df485 _52327d9f _pub-52327d9f _pub-9938313",
              },
              "\n          yarn add @paperclip/cli --dev && yarn @paperclip/cli init\n        "
            )
          )
        )
      ),
      React.createElement(
        Footer,
        {
          class: "_e5a11a52",
        },
        null
      )
    );
  })
);

var Footer = React.memo(
  React.forwardRef(function Footer(props, ref) {
    return React.createElement(
      "div",
      {
        className: "_9e606ded _52327d9f _pub-52327d9f _pub-9938313",
        ref: ref,
      },
      React.createElement(
        "div",
        {
          className: "_e8fe460e _52327d9f _pub-52327d9f _pub-9938313",
        },
        React.createElement(
          "div",
          {
            className: "_311169ff _52327d9f _pub-52327d9f _pub-9938313",
          },
          "\n      Paperclip is currently in closed beta, but sign up if you're interested and\n      we'll reach out soon!\n    "
        ),
        React.createElement(
          _pub2492Cc10_Anchor,
          {
            class:
              "_a8183845 _52327d9f _pub-52327d9f _pub-9938313" +
              " " +
              "_62dca9e0_semi-bold _pub-62dca9e0_semi-bold semi-bold",
            strong: true,
            href: "https://forms.gle/WJDVJEm9siYatABcA",
          },
          "\n      Sign up for early access\n    "
        )
      )
    );
  })
);
export { Footer };
