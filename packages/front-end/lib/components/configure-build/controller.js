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
import { configureBuildModalXClicked, configureBuildModalBackgroundClicked, openAppScriptConfigChanged, buildScriptConfigChanged } from "../../actions";
export default (Base) => class ConfigureBuildController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onCloseButtonClick = () => {
            this.props.dispatch(configureBuildModalXClicked());
        };
        this.onBackgroundClick = () => {
            this.props.dispatch(configureBuildModalBackgroundClicked());
        };
        this.onOpenCommandChangeComplete = (value) => {
            this.props.dispatch(openAppScriptConfigChanged(value));
        };
        this.onBuildCommandChangeComplete = (value) => {
            this.props.dispatch(buildScriptConfigChanged(value));
        };
    }
    render() {
        const { onCloseButtonClick, onBackgroundClick, onBuildCommandChangeComplete, onOpenCommandChangeComplete } = this;
        const _a = this.props, { projectInfo, dispatch } = _a, rest = __rest(_a, ["projectInfo", "dispatch"]);
        return (React.createElement(Base, Object.assign({}, rest, { closeButtonProps: {
                onClick: onCloseButtonClick
            }, backgroundProps: {
                onClick: onBackgroundClick
            }, buildCommandInputProps: {
                onChangeComplete: onBuildCommandChangeComplete,
                value: projectInfo.config.scripts && projectInfo.config.scripts.build
            }, openCommandInputProps: {
                onChangeComplete: onOpenCommandChangeComplete,
                value: projectInfo.config.scripts && projectInfo.config.scripts.openApp
            } })));
    }
};
//# sourceMappingURL=controller.js.map