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
import { noop } from "lodash";
import cx from "classnames";
import { compose } from "recompose";
import { DropdownMenuItem } from "../dropdown/menu.pc";
import { EMPTY_ARRAY } from "tandem-common";
export default compose((Base) => class AutoCompleteController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            openPopover: false,
            value: this.props.value,
            prevValue: this.props.value
        };
        this.onShouldClosePopover = () => {
            this.setState(Object.assign(Object.assign({}, this.state), { openPopover: false }));
        };
        this.onBlur = event => {
            this.setState(Object.assign(Object.assign({}, this.state), { openPopover: false }));
            this.props.onBlur && this.props.onBlur(event);
        };
        this.onFocus = () => {
            this.setState(Object.assign(Object.assign({}, this.state), { openPopover: true }));
        };
        this.onChange = value => {
            this.setState({ value, prevValue: this.props.value });
            if (this.props.onChange) {
                this.props.onChange(value);
            }
        };
    }
    componentWillUpdate(props, state) {
        if (props.value !== state.prevValue) {
            this.setState({ value: props.value, prevValue: props.value });
        }
    }
    render() {
        const _a = this.props, { onKeyDown, autoCompleteOptions, onChangeComplete = noop } = _a, rest = __rest(_a, ["onKeyDown", "autoCompleteOptions", "onChangeComplete"]);
        const { onShouldClosePopover, onFocus, onBlur, onChange } = this;
        const { openPopover, value } = this.state;
        const open = openPopover && !value;
        const menuItems = open
            ? autoCompleteOptions.map((option, i) => {
                return (React.createElement(DropdownMenuItem, { variant: cx({
                        alt: Boolean(i % 2),
                        special: option.special
                    }), onClick: () => onChangeComplete(option.value) }, option.label));
            })
            : EMPTY_ARRAY;
        return (React.createElement(Base, Object.assign({}, rest, { textInputProps: {
                value,
                onFocus,
                onChange
            }, popoverProps: {
                open,
                onShouldClose: onShouldClosePopover
            }, menu: menuItems })));
    }
});
//# sourceMappingURL=auto-complete-controller.js.map