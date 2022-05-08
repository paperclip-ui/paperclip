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
import { PCQueryType } from "paperclip";
import { QUERY_DROPDOWN_OPTIONS } from "./utils";
import { queryTypeChanged } from "../../../../../actions";
export default (Base) => class QueryOptionsController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onTypeChange = (value) => {
            this.props.dispatch(queryTypeChanged(this.props.query, value));
        };
    }
    render() {
        const { onTypeChange } = this;
        const _a = this.props, { query, dispatch, globalVariables } = _a, rest = __rest(_a, ["query", "dispatch", "globalVariables"]);
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                media: query.type === PCQueryType.MEDIA,
                variable: query.type === PCQueryType.VARIABLE
            }), typeInputProps: {
                value: query.type,
                onChangeComplete: onTypeChange,
                options: QUERY_DROPDOWN_OPTIONS
            }, mediaQueryOptionsProps: {
                query: query,
                dispatch
            }, variableQueryOptionsProps: {
                query: query,
                globalVariables,
                dispatch
            } })));
    }
};
//# sourceMappingURL=query-options-controller.js.map