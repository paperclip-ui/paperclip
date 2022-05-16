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

export const classNames = {
  _col: "_pub-9938313__col",
  _col10: "_pub-9938313__col10",
  _col12: "_pub-9938313__col12",
  _col2: "_pub-9938313__col2",
  _col3: "_pub-9938313__col3",
  _col4: "_pub-9938313__col4",
  _col6: "_pub-9938313__col6",
  _col8: "_pub-9938313__col8",
  _col9: "_pub-9938313__col9",
  "_my-1": "_pub-9938313__my-1",
  "_py-6": "_pub-9938313__py-6",
  _row: "_pub-9938313__row",
  _section: "_pub-9938313__section",
  "text-center": "_pub-9938313_text-center",
};

var C3 = React.memo(
  React.forwardRef(function C3(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_2a6f1da2 _9938313 _pub-9938313" +
          " " +
          "_9938313__col _pub-9938313__col _col _9938313__col3 _pub-9938313__col3 _col3 " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { C3 };

var C6 = React.memo(
  React.forwardRef(function C6(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_c30cb897 _9938313 _pub-9938313" +
          " " +
          "_9938313__col _pub-9938313__col _col _9938313__col6 _pub-9938313__col6 _col6 " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { C6 };

var C9 = React.memo(
  React.forwardRef(function C9(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_2d02d9bb _9938313 _pub-9938313" +
          " " +
          "_9938313__col _pub-9938313__col _col _9938313__col9 _pub-9938313__col9 _col9 " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { C9 };

var C12 = React.memo(
  React.forwardRef(function C12(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_cabaf4bc _9938313 _pub-9938313" +
          " " +
          "_9938313__col _pub-9938313__col _col _9938313__col12 _pub-9938313__col12 _col12 " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { C12 };

var Row = React.memo(
  React.forwardRef(function Row(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_e704213b _9938313 _pub-9938313" +
          " " +
          "_9938313__row _pub-9938313__row _row " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Row };

var Container = React.memo(
  React.forwardRef(function Container(props, ref) {
    return React.createElement(
      "div",
      {
        className:
          "_90a4017 _9938313 _pub-9938313" +
          " " +
          "_9938313__container _pub-9938313__container _container " +
          (props["class"] ? " " + props["class"] : ""),
        ref: ref,
      },
      props["children"]
    );
  })
);
export { Container };
