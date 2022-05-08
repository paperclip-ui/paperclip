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
export default (Base) => class GlobalPropertiesController extends React.PureComponent {
    render() {
        const _a = this.props, { dispatch, globalFileUri, globalQueries, globalVariables, fontFamilies } = _a, rest = __rest(_a, ["dispatch", "globalFileUri", "globalQueries", "globalVariables", "fontFamilies"]);
        return (React.createElement(Base, Object.assign({}, rest, { variablesSectionProps: {
                show: true,
                dispatch,
                globalFileUri,
                globalVariables,
                fontFamilies
            }, queriesPaneProps: {
                dispatch,
                globalVariables,
                globalQueries
            } })));
    }
};
//# sourceMappingURL=global-properties-controller.js.map