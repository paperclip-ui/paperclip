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
import { reload } from "../../../actions";
export default (Base) => class BaseReporterController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onResetClick = () => {
            this.props.dispatch(reload());
            // safety measure incase reload action handler is not working
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        };
    }
    render() {
        const { onResetClick } = this;
        const rest = __rest(this.props, []);
        return React.createElement(Base, Object.assign({}, rest, { restartButtonProps: { onClick: onResetClick } }));
    }
};
//# sourceMappingURL=controller.js.map