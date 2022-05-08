import "./index.scss";
import * as React from "react";
import { compose, pure, withState, withHandlers } from "recompose";
const InputComponent = ({ value, label, onChange }) => {
    return (React.createElement("div", { className: "field" }));
};
const HexInputComponent = ({ value }) => {
    return (React.createElement("div", { className: "fields" },
        React.createElement(InputComponent, { label: "hex", value: 0 })));
};
const RGBAInputComponent = ({ value }) => {
    return (React.createElement("div", { className: "fields" },
        React.createElement(InputComponent, { label: "r", value: 0 }),
        React.createElement(InputComponent, { label: "g", value: 0 }),
        React.createElement(InputComponent, { label: "b", value: 0 }),
        React.createElement(InputComponent, { label: "a", value: 0 })));
};
const OPTIONS = [RGBAInputComponent, HexInputComponent];
const BaseRawColorInputComponent = ({ value, onSwitcherClick }) => {
    return (React.createElement("div", { className: "m-raw-color-input" },
        React.createElement(RGBAInputComponent, { value: value }),
        React.createElement("div", { className: "switcher" },
            React.createElement("i", { className: "ion-arrow-up-b" }),
            React.createElement("i", { className: "ion-arrow-down-b" }))));
};
const enhance = compose(pure, withState("currentInputIndex", "setCurrentInputIndex", 0), withHandlers({
    onSwitcherClick: () => () => { }
}));
export const RawColorInputComponent = enhance(BaseRawColorInputComponent);
//# sourceMappingURL=index.js.map