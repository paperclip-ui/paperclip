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
import cx from "classnames";
import { DropdownMenuItem } from "./menu.pc";
import { EMPTY_ARRAY, memoize } from "tandem-common";
export const NO_OPTION = {
    label: "--",
    value: undefined
};
export const dropdownMenuOptionFromValue = (value) => ({ label: value || "--", value });
export const mapVariablesToDropdownOptions = memoize((variables) => {
    return variables.map(variable => ({
        value: variable,
        label: variable.label,
        special: true
    }));
});
export default (Base) => {
    return class DropdownController extends React.PureComponent {
        constructor(props) {
            super(props);
            this.onMouseDown = event => {
                // only open if _not_ opened yet. The popover will call onShouldClose if already open
                // since the button is technically out of the popover scope.
                if (!this.state.open) {
                    this.setState(Object.assign(Object.assign({}, this.state), { open: true }));
                }
                if (this.props.onMouseDown) {
                    this.props.onMouseDown(event);
                }
            };
            this.onFilterChange = value => {
                this.setState(Object.assign(Object.assign({}, this.state), { filter: value ? String(value).toLowerCase() : null }));
            };
            this.onItemClick = (item, event) => {
                const { onChange, onChangeComplete } = this.props;
                this.setState(Object.assign(Object.assign({}, this.state), { open: false }));
                if (onChange) {
                    onChange(item.value);
                }
                if (onChangeComplete) {
                    onChangeComplete(item.value);
                }
            };
            this.onKeyDown = event => {
                if (event.key === "Enter") {
                    this.setState(Object.assign(Object.assign({}, this.state), { open: true }));
                }
            };
            this.onShouldClose = () => {
                this.setState(Object.assign(Object.assign({}, this.state), { open: false }));
            };
            this.state = {
                open: false,
                filter: null
            };
        }
        componentWillUpdate(props) {
            if (this.props.value !== props.value && this.state.filter) {
                this.setState(Object.assign(Object.assign({}, this.state), { filter: null, open: false }));
            }
        }
        render() {
            const _a = this.props, { value, options = EMPTY_ARRAY, filterable, onMouseDown, onChange, onChangeComplete } = _a, rest = __rest(_a, ["value", "options", "filterable", "onMouseDown", "onChange", "onChangeComplete"]);
            const { open, filter } = this.state;
            const menuItems = open
                ? options
                    .filter(({ label }) => !filter ||
                    String(label)
                        .toLowerCase()
                        .indexOf(filter) !== -1)
                    .map((item, i) => {
                    return (React.createElement(DropdownMenuItem, { key: i, variant: cx({
                            alt: Boolean(i % 2),
                            special: item.special
                        }), onClick: event => this.onItemClick(item, event) }, item.label));
                })
                : EMPTY_ARRAY;
            const selectedItem = options.find(item => item.value === value);
            const showFilter = open && filterable !== false;
            return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                    special: selectedItem && selectedItem.special
                }), popoverProps: {
                    open,
                    onShouldClose: this.onShouldClose
                }, filterInputProps: {
                    style: {
                        display: showFilter ? "block" : "none"
                    },
                    value: selectedItem && selectedItem.label,
                    focus: showFilter,
                    onChange: this.onFilterChange
                }, tabIndex: 0, onKeyDown: this.onKeyDown, options: menuItems, labelProps: {
                    style: {
                        display: showFilter ? "none" : "block"
                    },
                    text: (selectedItem && selectedItem.label) || "--"
                }, onMouseDown: this.onMouseDown })));
        }
    };
};
//# sourceMappingURL=controller.js.map