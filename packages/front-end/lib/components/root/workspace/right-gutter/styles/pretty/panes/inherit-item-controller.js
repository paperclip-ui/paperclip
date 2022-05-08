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
import { memoize } from "tandem-common";
import { inheritItemComponentTypeChangeComplete } from "../../../../../../../actions";
export default (Base) => class InheritItemController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChangeComplete = value => {
            this.props.dispatch(inheritItemComponentTypeChangeComplete(this.props.styleMixinId, value.id));
        };
        this.onClick = () => {
            this.props.onClick(this.props.styleMixinId);
        };
    }
    render() {
        const _a = this.props, { selected, styleMixin, allStyleMixins, alt } = _a, rest = __rest(_a, ["selected", "styleMixin", "allStyleMixins", "alt"]);
        const { onClick, onChangeComplete } = this;
        return (React.createElement(Base, Object.assign({}, rest, { onClick: onClick, variant: cx({ selected, alt }), dropdownProps: {
                onClick: event => event.stopPropagation(),
                filterable: true,
                value: styleMixin,
                options: getStyleMixinOptions(allStyleMixins),
                onChangeComplete: onChangeComplete
            } })));
    }
};
const getStyleMixinOptions = memoize((styleMixins) => {
    return styleMixins
        .map(styleMixin => {
        return {
            label: styleMixin.label,
            value: styleMixin
        };
    })
        .sort((a, b) => (a.label > b.label ? -1 : 1));
});
//# sourceMappingURL=inherit-item-controller.js.map