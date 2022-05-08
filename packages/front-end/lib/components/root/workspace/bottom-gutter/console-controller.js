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
import { ConsoleTab } from "./view.pc";
export default (Base) => class ConsoleController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            selectedTabIndex: 0
        };
        this.selectTabIndex = (index) => {
            this.setState(Object.assign(Object.assign({}, this.state), { selectedTabIndex: index }));
        };
    }
    render() {
        const { selectTabIndex } = this;
        const _a = this.props, { scriptProcesses } = _a, rest = __rest(_a, ["scriptProcesses"]);
        const { selectedTabIndex } = this.state;
        const tabs = scriptProcesses.map((process, i) => {
            return (React.createElement(ConsoleTab, { variant: cx({
                    selected: selectedTabIndex === i
                }), onClick: () => selectTabIndex(i), labelProps: { text: process.label } }));
        });
        const scriptProcess = scriptProcesses[selectedTabIndex];
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({ noProcesses: scriptProcesses.length === 0 }), consoleLogsProps: { scriptProcess }, tabs: tabs })));
    }
};
//# sourceMappingURL=console-controller.js.map