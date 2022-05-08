/**
 * light IDE for text inputs - used particularly for editing raw CSS
 */
/*

TODOS:

- [ ] copy / paste
- [ ] left / right arrows
- [ ] ctrl+a
- [ ] backspace
- [ ] shift backspace
*/
import "./index.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { PreviewComponent } from "./preview";
import { calcCaretPosition } from "./utils";
import { compose, pure, withHandlers } from "recompose";
const BaseLightIDEComponent = ({ tokens, onMouseDown }) => {
    return (React.createElement("div", { className: "m-light-text-editor", tabIndex: 0, onMouseDown: onMouseDown },
        React.createElement(PreviewComponent, { tokens: tokens }),
        React.createElement("div", { className: "cursor" })));
};
const enhance = compose(pure, withHandlers({
    onMouseDown: ({ tokens }) => (event) => {
        const pos = calcCaretPosition(ReactDOM.findDOMNode(this), tokens, event.nativeEvent);
    }
}));
export const LightIDEComponent = enhance(BaseLightIDEComponent);
export * from "./state";
//# sourceMappingURL=index.js.map