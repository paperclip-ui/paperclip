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
import { BuildButtonOption } from "./view.pc";
import { buildButtonStartClicked, buildButtonConfigureClicked, buildButtonStopClicked, buildButtonOpenAppClicked } from "../../../actions";
import { last } from "lodash";
export default (Base) => class BuildButtonController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            open: false
        };
        this.onBuildButtonClick = () => {
            if (!this.state.open) {
                this.setState({
                    open: true
                });
            }
        };
        this.onShouldClose = () => {
            this.closeMenu();
        };
        this.onStartClick = () => {
            this.props.dispatch(buildButtonStartClicked());
            this.closeMenu();
        };
        this.onConfigureClick = () => {
            this.props.dispatch(buildButtonConfigureClicked());
            this.closeMenu();
        };
        this.onStopClick = () => {
            this.props.dispatch(buildButtonStopClicked());
            this.closeMenu();
        };
        this.onOpenAppClick = () => {
            this.props.dispatch(buildButtonOpenAppClicked());
            this.closeMenu();
        };
    }
    closeMenu() {
        this.setState({ open: false });
    }
    render() {
        const { onShouldClose, onBuildButtonClick, onStartClick, onOpenAppClick, onStopClick, onConfigureClick } = this;
        const { open } = this.state;
        const _a = this.props, { buildScriptProcess, hasBuildScript, hasOpenScript } = _a, rest = __rest(_a, ["buildScriptProcess", "hasBuildScript", "hasOpenScript"]);
        let building = Boolean(buildScriptProcess);
        let errored = false;
        let label;
        if (buildScriptProcess) {
            label = "Building project";
            const lastLog = last(buildScriptProcess.logs);
            errored = lastLog && lastLog.error;
        }
        else {
            label = "Build stopped";
        }
        let buildButtonMenuItems = [];
        if (!building) {
            buildButtonMenuItems = [
                React.createElement(BuildButtonOption, { key: "configure", labelProps: { text: "Configure" }, onClick: onConfigureClick }),
                hasBuildScript ? (React.createElement(BuildButtonOption, { key: "start", labelProps: { text: "Start" }, onClick: onStartClick })) : null
            ];
        }
        else {
            buildButtonMenuItems = [
                React.createElement(BuildButtonOption, { key: "configure", labelProps: { text: "Configure" }, onClick: onConfigureClick }),
                hasOpenScript ? (React.createElement(BuildButtonOption, { key: "configure", labelProps: { text: "Open app" }, onClick: onOpenAppClick })) : null,
                React.createElement(BuildButtonOption, { key: "configure", labelProps: { text: "Stop" }, onClick: onStopClick })
            ];
        }
        buildButtonMenuItems = buildButtonMenuItems.filter(Boolean);
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                building,
                paused: !building
            }), popoverProps: {
                open,
                onShouldClose,
                centered: true
            }, labelProps: {
                text: label
            }, buildButtonProps: {
                onMouseDown: onBuildButtonClick
            }, buildButtonMenuProps: {
                items: buildButtonMenuItems
            } })));
    }
};
//# sourceMappingURL=build-button-controller.js.map