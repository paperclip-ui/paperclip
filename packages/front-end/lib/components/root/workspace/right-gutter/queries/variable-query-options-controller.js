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
import { PCQueryType } from "paperclip";
import { variableQuerySourceVariableChange, queryConditionChanged } from "../../../../../actions";
import { EMPTY_OBJECT, memoize } from "tandem-common";
export default (Base) => class VariableQueryOptionsController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onSourceVariableChange = (value) => {
            this.props.dispatch(variableQuerySourceVariableChange(this.props.query, value));
        };
        this.onEqualsChange = (value) => {
            this.props.dispatch(queryConditionChanged(this.props.query, Object.assign(Object.assign({}, (this.props.query.condition || EMPTY_OBJECT)), { equals: value })));
        };
        this.onNotEqualsChange = (value) => {
            this.props.dispatch(queryConditionChanged(this.props.query, Object.assign(Object.assign({}, (this.props.query.condition || EMPTY_OBJECT)), { notEquals: value })));
        };
    }
    render() {
        const { onSourceVariableChange, onEqualsChange, onNotEqualsChange } = this;
        const _a = this.props, { query, globalVariables } = _a, rest = __rest(_a, ["query", "globalVariables"]);
        if (query.type !== PCQueryType.VARIABLE) {
            return null;
        }
        return (React.createElement(Base, Object.assign({}, rest, { variableInputProps: {
                filterable: true,
                value: globalVariables.find(variable => variable.id === query.sourceVariableId),
                options: getVariableDropdownOptions(globalVariables),
                onChangeComplete: onSourceVariableChange
            }, equalsInputProps: {
                value: query.condition && query.condition.equals,
                onChangeComplete: onEqualsChange
            }, notEqualsInputProps: {
                value: query.condition && query.condition.notEquals,
                onChangeComplete: onNotEqualsChange
            } })));
    }
};
const getVariableDropdownOptions = memoize((variables) => {
    return variables.map(variable => {
        return {
            label: variable.label,
            value: variable
        };
    });
});
//# sourceMappingURL=variable-query-options-controller.js.map