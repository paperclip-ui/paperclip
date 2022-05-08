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
import { QueryOptions } from "./view.pc";
import { queryLabelChanged } from "../../../../../actions";
export default (Base) => class BaseQueryItemController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onLabelChange = (value) => {
            this.props.dispatch(queryLabelChanged(this.props.query, value));
        };
    }
    render() {
        const { onLabelChange } = this;
        const _a = this.props, { query, dispatch, globalVariables } = _a, rest = __rest(_a, ["query", "dispatch", "globalVariables"]);
        return (React.createElement(Base, Object.assign({}, rest, { queryOptionsProps: null, editButtonProps: {
                right: true,
                content: (React.createElement(QueryOptions, { dispatch: dispatch, query: query, globalVariables: globalVariables }))
            }, labelInputProps: {
                value: query.label,
                focus: !query.label,
                onChangeComplete: onLabelChange
            } })));
    }
};
//# sourceMappingURL=query-item-controller.js.map