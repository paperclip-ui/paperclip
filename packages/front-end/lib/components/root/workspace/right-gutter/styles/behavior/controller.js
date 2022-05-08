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
export default (Base) => class StyleBehaviorController extends React.PureComponent {
    render() {
        const _a = this.props, { globalQueries, dispatch, variantTriggers, variants } = _a, rest = __rest(_a, ["globalQueries", "dispatch", "variantTriggers", "variants"]);
        return (React.createElement(Base, Object.assign({}, rest, { triggersPaneProps: {
                variantTriggers,
                globalQueries,
                variants,
                dispatch
            } })));
    }
};
//# sourceMappingURL=controller.js.map