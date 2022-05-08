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
import { ConsoleLog } from "./view.pc";
export default (Base) => class ConsoleLogsController extends React.PureComponent {
    render() {
        const _a = this.props, { scriptProcess } = _a, rest = __rest(_a, ["scriptProcess"]);
        if (!scriptProcess) {
            return null;
        }
        const logs = scriptProcess.logs.map((log, i) => {
            return (React.createElement(ConsoleLog, { key: i, labelProps: { text: log.text }, variant: cx({
                    error: log.error
                }) }));
        });
        return React.createElement(Base, Object.assign({}, rest, { content: logs }));
    }
};
//# sourceMappingURL=console-logs-controller.js.map