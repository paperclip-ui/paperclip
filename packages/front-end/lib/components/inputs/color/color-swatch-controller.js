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
import { ColorSwatchItem } from "./picker.pc";
import { EMPTY_ARRAY, memoize } from "tandem-common";
export const maybeConvertSwatchValueToColor = (value, swatchOptionGroups = []) => {
    for (const group of swatchOptionGroups) {
        const option = group.options.find(option => option.value === value);
        if (option) {
            return option.color;
        }
    }
    return value;
};
export const mapValueToColorSwatch = (value) => ({
    value,
    color: value
});
export const getColorSwatchOptionsFromValues = memoize((value) => value.map(mapValueToColorSwatch));
const getColorSwatchGroupFromValue = (value, groups) => {
    if (!groups.length) {
        return 0;
    }
    for (const group of groups) {
        const option = group.options.find(option => option.value === value);
        if (option) {
            return group;
        }
    }
    return groups[0];
};
export default (Base) => class ColorSwatchesController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            selectedGroupIndex: 0,
            value: null
        };
        this.onGroupChange = (group) => {
            this.setState(Object.assign(Object.assign({}, this.state), { selectedGroupIndex: this.props.optionGroups.indexOf(group) }));
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.value !== prevState.value &&
            nextProps.optionGroups.length) {
            const selectedGroup = getColorSwatchGroupFromValue(nextProps.value, nextProps.optionGroups);
            return {
                selectedGroupIndex: selectedGroup
                    ? nextProps.optionGroups.indexOf(selectedGroup)
                    : 0,
                value: nextProps.value
            };
        }
        return null;
    }
    render() {
        const _a = this.props, { value: selectedValue, optionGroups = EMPTY_ARRAY, onChange } = _a, rest = __rest(_a, ["value", "optionGroups", "onChange"]);
        const { onGroupChange } = this;
        const { selectedGroupIndex } = this.state;
        if (!optionGroups.length) {
            return null;
        }
        const selectedGroup = optionGroups[Math.min(selectedGroupIndex, optionGroups.length - 1)];
        const content = selectedGroup.options.map(({ color, value, label }, i) => {
            return (React.createElement(ColorSwatchItem, { key: i, title: label, variant: cx({
                    selected: selectedValue === value
                }), onClick: () => onChange(value), pillProps: {
                    style: {
                        background: color
                    }
                } }));
        });
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                hasMultipleGroups: optionGroups.length > 1
            }), swatchSourceInputProps: {
                value: selectedGroup,
                options: mapColorSwatchGroupsToDropdownOptions(optionGroups),
                onChangeComplete: onGroupChange
            }, content: content })));
    }
};
const mapColorSwatchGroupsToDropdownOptions = memoize((groups) => {
    return groups.map(group => ({
        label: group.label,
        value: group
    }));
});
//# sourceMappingURL=color-swatch-controller.js.map