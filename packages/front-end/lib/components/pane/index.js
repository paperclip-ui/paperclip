import "./index.scss";
import * as React from "react";
import cx from "classnames";
export const PaneComponent = ({ header, children, className, secondary }) => (React.createElement("div", { className: cx({ "m-panel": true, headerless: !header, secondary }, className) },
    header && React.createElement("div", { className: "header" }, header),
    React.createElement("div", { className: "content-outer" }, children)));
//# sourceMappingURL=index.js.map