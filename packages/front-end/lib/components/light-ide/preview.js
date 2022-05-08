import "./preview.scss";
import * as React from "react";
// TODO - create token factory
const BasePreviewComponent = ({ tokens }) => (React.createElement("div", { className: "m-light-text-editor--preview" }, tokens.map((token, i) => (React.createElement("span", { key: token.type + i, className: `token ${token.type}` }, token.value)))));
export const PreviewComponent = BasePreviewComponent;
//# sourceMappingURL=preview.js.map