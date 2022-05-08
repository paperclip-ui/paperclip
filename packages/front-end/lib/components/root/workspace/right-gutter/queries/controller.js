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
import { QueryItem } from "./view.pc";
import { addQueryButtonClick } from "../../../../../actions";
import { QUERY_DROPDOWN_OPTIONS } from "./utils";
export default (Base) => class MediaQueriesController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onAddQueryDropdownSelect = (value) => {
            this.props.dispatch(addQueryButtonClick(value));
        };
    }
    render() {
        const { onAddQueryDropdownSelect } = this;
        const _a = this.props, { globalQueries, globalVariables, dispatch } = _a, rest = __rest(_a, ["globalQueries", "globalVariables", "dispatch"]);
        const items = globalQueries.map(query => {
            return (React.createElement(QueryItem, { dispatch: dispatch, key: query.id, query: query, globalVariables: globalVariables }));
        });
        return (React.createElement(Base, Object.assign({}, rest, { elementProps1: null, elementProps2: null, elementProps3: null, elementProps4: null, elementProps5: null, addQueryDropdownProps: {
                options: QUERY_DROPDOWN_OPTIONS,
                onChangeComplete: onAddQueryDropdownSelect
            }, items: items })));
    }
};
//# sourceMappingURL=controller.js.map