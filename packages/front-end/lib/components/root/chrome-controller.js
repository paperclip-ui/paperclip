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
import * as path from "path";
import { IS_MAC_OS, IS_WINDOWS } from "../../state";
import { CHROME_HEADER_MOUSE_DOWN, CHROME_CLOSE_BUTTON_CLICKED, CHROME_MINIMIZE_BUTTON_CLICKED, CHROME_MAXIMIZE_BUTTON_CLICKED } from "../../actions";
export default (Base) => class ChromeController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onHeaderClick = (event) => {
            this.props.dispatch({ type: CHROME_HEADER_MOUSE_DOWN });
        };
        this.onCloseClick = (event) => {
            const { unsaved } = this.props;
            this.props.dispatch({
                type: CHROME_CLOSE_BUTTON_CLICKED,
                unsaved,
                "@@public": true
            });
            event.stopPropagation();
        };
        this.onMinimizeClick = (event) => {
            this.props.dispatch({
                type: CHROME_MINIMIZE_BUTTON_CLICKED,
                "@@public": true
            });
            event.stopPropagation();
        };
        this.onMaximizeClick = (event) => {
            this.props.dispatch({
                type: CHROME_MAXIMIZE_BUTTON_CLICKED,
                "@@public": true
            });
            event.stopPropagation();
        };
    }
    render() {
        const _a = this.props, { projectInfo, unsaved } = _a, rest = __rest(_a, ["projectInfo", "unsaved"]);
        const { onHeaderClick, onCloseClick, onMinimizeClick, onMaximizeClick } = this;
        let title = "";
        if (projectInfo) {
            title = path.basename(projectInfo.path);
        }
        else {
            title = "Welcome";
        }
        return (React.createElement(Base, Object.assign({}, rest, { label: title, variant: cx({
                unsaved,
                macos: IS_MAC_OS,
                windows: IS_WINDOWS,
                hasSelectedProject: Boolean(projectInfo)
            }), headerProps: {
                onClick: onHeaderClick
            }, contentProps: {
                onScroll: resetScroll
            }, closeButtonProps: {
                onClick: onCloseClick
            }, minimizeButtonProps: {
                onClick: onMinimizeClick
            }, maximizeButtonProps: {
                onClick: onMaximizeClick
            } })));
    }
};
// prevents pushing content up when auto scrolling file navigator and layers
const resetScroll = event => {
    event.preventDefault();
    event.currentTarget.scrollTop = event.currentTarget.scrollLeft = 0;
};
//# sourceMappingURL=chrome-controller.js.map