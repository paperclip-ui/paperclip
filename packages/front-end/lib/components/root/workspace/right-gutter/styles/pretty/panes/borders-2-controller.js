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
import { cssPropertyChanged, cssPropertyChangeCompleted } from "../../../../../../../actions";
export default (Base) => class Borders2Controller extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPropertyChange = (name, value) => {
            this.props.dispatch(cssPropertyChanged(name, value));
        };
        this.onPropertyChangeComplete = (name, value) => {
            this.props.dispatch(cssPropertyChangeCompleted(name, value));
        };
    }
    render() {
        const { onPropertyChange, onPropertyChangeComplete } = this;
        const _a = this.props, { documentColors, globalVariables, computedStyleInfo } = _a, rest = __rest(_a, ["documentColors", "globalVariables", "computedStyleInfo"]);
        return (React.createElement(Base, Object.assign({}, rest, { colorInputProps: {
                documentColors,
                globalVariables,
                computedStyleInfo,
                onPropertyChange,
                onPropertyChangeComplete
            }, radiusInputProps: {
                computedStyleInfo,
                onPropertyChange,
                onPropertyChangeComplete
            } })));
    }
};
//# sourceMappingURL=borders-2-controller.js.map