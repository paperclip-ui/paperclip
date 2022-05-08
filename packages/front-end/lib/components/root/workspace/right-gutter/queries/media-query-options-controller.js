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
import { queryConditionChanged } from "../../../../../actions";
import { EMPTY_OBJECT } from "tandem-common";
export default (Base) => class MediaQueryOptionsController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onMinWidthChange = (minWidth) => {
            this.props.dispatch(queryConditionChanged(this.props.query, Object.assign(Object.assign({}, (this.props.query.condition || EMPTY_OBJECT)), { maxWidth: minWidth && Number(minWidth) })));
        };
        this.onMaxWidthChange = (maxWidth) => {
            this.props.dispatch(queryConditionChanged(this.props.query, Object.assign(Object.assign({}, (this.props.query.condition || EMPTY_OBJECT)), { maxWidth: maxWidth && Number(maxWidth) })));
        };
    }
    render() {
        const { onMinWidthChange, onMaxWidthChange } = this;
        const _a = this.props, { query } = _a, rest = __rest(_a, ["query"]);
        return (React.createElement(Base, Object.assign({}, rest, { minWidthInputProps: {
                value: query.condition && query.condition.minWidth,
                onChangeComplete: onMinWidthChange
            }, maxWidthInputProps: {
                value: query.condition && query.condition.maxWidth,
                onChangeComplete: onMaxWidthChange
            } })));
    }
};
//# sourceMappingURL=media-query-options-controller.js.map