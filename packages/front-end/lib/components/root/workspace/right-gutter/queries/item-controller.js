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
// import { BaseMediaQueryItemProps } from "./view.pc";
import { queryConditionChanged } from "../../../../../actions";
export default (Base) => class MediaQueryItemController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onLabelWidthChange = (value) => {
            this.props.dispatch(queryConditionChanged(this.props.mediaQuery, { label: value }));
        };
        this.onMinWidthChange = (value) => {
            this.props.dispatch(queryConditionChanged(this.props.mediaQuery, {
            // minWidth: value
            }));
        };
        this.onMaxWidthChange = (value) => {
            this.props.dispatch(queryConditionChanged(this.props.mediaQuery, {
            // maxWidth: value
            }));
        };
    }
    render() {
        const { onLabelWidthChange, onMinWidthChange, onMaxWidthChange } = this;
        const _a = this.props, { mediaQuery } = _a, rest = __rest(_a, ["mediaQuery"]);
        return (React.createElement(Base, Object.assign({}, rest, { nameInputProps: {
                value: mediaQuery.label,
                onChangeComplete: onLabelWidthChange,
                focus: mediaQuery.label == null
            }, minWidthInputProps: {
                // value: mediaQuery.minWidth,
                onChangeComplete: onMinWidthChange
            }, maxWidthInputProps: {
                // value: mediaQuery.maxWidth,
                onChangeComplete: onMaxWidthChange
            } })));
    }
};
//# sourceMappingURL=item-controller.js.map