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
import * as ReactDOM from "react-dom";
import { compose } from "recompose";
import { FocusComponent } from "../../focus";
export const withPureInputHandlers = () => (Base) => {
    return class InputHandlersWrapper extends React.PureComponent {
        constructor() {
            super(...arguments);
            // needed so that sub components get updates value if source doesn't change.
            this.state = {
                value: this.props.value,
                _value: this.props.value
            };
            this.onKeyDown = event => {
                const { onKeyDown, onChange, onChangeComplete } = this.props;
                if (onKeyDown) {
                    onKeyDown(event);
                }
                const nativeEvent = event.nativeEvent;
                setTimeout(() => {
                    const { key, target: { value: newValue } } = nativeEvent;
                    const oldState = this.state;
                    this.setState(Object.assign(Object.assign({}, oldState), { value: newValue }), () => {
                        if (onChange && oldState.value !== newValue) {
                            onChange(newValue || undefined);
                        }
                        if (key === "Enter" && onChangeComplete) {
                            onChangeComplete(newValue || undefined);
                        }
                    });
                });
            };
            this.onBlur = event => {
                const { onChangeComplete } = this.props;
                if (onChangeComplete) {
                    onChangeComplete(event.target.value || undefined);
                }
            };
        }
        static getDerivedStateFromProps(props, state) {
            let newState = state;
            if (props.value !== state._value) {
                newState = Object.assign(Object.assign({}, newState), { _value: props.value, value: props.value });
            }
            return newState === state ? null : newState;
        }
        componentDidUpdate(props) {
            if (props.value !== this.props.value) {
                const input = ReactDOM.findDOMNode(this);
                if (document.activeElement !== input) {
                    input.value = this.props.value == null ? "" : this.props.value;
                }
            }
        }
        render() {
            const { onKeyDown, onBlur } = this;
            return React.createElement(Base, Object.assign({}, this.props, { onKeyDown: onKeyDown, onBlur: onBlur }));
        }
    };
};
export default compose(withPureInputHandlers(), (Base) => (_a) => {
    var { value, focus, onChange, onChangeComplete } = _a, rest = __rest(_a, ["value", "focus", "onChange", "onChangeComplete"]);
    return (React.createElement(FocusComponent, { focus: Boolean(focus) },
        React.createElement(Base, Object.assign({}, rest, { defaultValue: value }))));
});
//# sourceMappingURL=controller.js.map