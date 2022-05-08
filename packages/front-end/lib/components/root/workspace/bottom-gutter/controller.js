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
import { closeBottomGutterButtonClicked } from "../../../../actions";
export default (Base) => class BottomGutterController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onCloseClick = () => {
            this.props.dispatch(closeBottomGutterButtonClicked());
        };
    }
    render() {
        const { onCloseClick } = this;
        const _a = this.props, { show, dispatch, scriptProcesses } = _a, rest = __rest(_a, ["show", "dispatch", "scriptProcesses"]);
        if (!show) {
            return false;
        }
        return (React.createElement(Base, Object.assign({}, rest, { closeButtonProps: {
                onClick: onCloseClick
            }, consoleProps: {
                scriptProcesses,
                dispatch
            } })));
    }
};
//# sourceMappingURL=controller.js.map