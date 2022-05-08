var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
export default (Base) => {
    return class StyleValueController extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.onChange = value => {
                if (this.props.onChange) {
                    this.props.onChange(value);
                }
            };
            this.onChangeComplete = value => {
                if (this.props.onChangeComplete) {
                    this.props.onChangeComplete(value);
                }
            };
        }
        render() {
            const _a = this.props, { value } = _a, rest = __rest(_a, ["value"]);
            const { onChange, onChangeComplete } = this;
            let inputValue = value;
            // "unset" may be defined if the user clears an overridden field. "Unset" is used to clear
            // overrides since that's also the native CSS behavior. However, we want to hide that from the user since a cleared field
            // should communicate "unset" just fine (definitely more intuitive).
            if (value === "unset") {
                inputValue = null;
            }
            return (React.createElement(Base, Object.assign({}, rest, { value: inputValue, onChange: onChange, onChangeComplete: onChangeComplete })));
        }
    };
};
//# sourceMappingURL=style-value-controller.js.map