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
import { SidePanel } from "./view.pc";
import cx from "classnames";
const SIDEBAR_WIDTH = 250;
export default (Base) => class SidePanelButtonController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            open: false
        };
        this.onShouldClose = () => {
            this.close();
        };
        this.onButtonClick = () => {
            this.setState(Object.assign(Object.assign({}, this.state), { open: !this.state.open }));
        };
        this.updatePopoverPosition = (point, popoverRect) => {
            if (this.props.left) {
                // TODO - this needs to be pulled from state
                point = {
                    left: SIDEBAR_WIDTH,
                    top: point.top
                };
            }
            else if (this.props.right) {
                point = {
                    left: window.innerWidth -
                        (SIDEBAR_WIDTH + (popoverRect.right - popoverRect.left)),
                    top: point.top
                };
            }
            return point;
        };
        this.onCloseButtonClick = () => {
            this.close();
        };
        this.onKeyUp = (event) => {
            if (event.key === "Enter") {
                this.close();
            }
        };
        this.close = () => {
            this.setState(Object.assign(Object.assign({}, this.state), { open: false }));
        };
    }
    render() {
        const { onKeyUp, onButtonClick, onCloseButtonClick, onShouldClose, updatePopoverPosition } = this;
        const _a = this.props, { content, left, right } = _a, rest = __rest(_a, ["content", "left", "right"]);
        const { open } = this.state;
        return (React.createElement(Base, Object.assign({}, rest, { buttonOuterProps: {
                onClick: onButtonClick
            }, popoverProps: {
                open: open,
                onShouldClose: onShouldClose,
                updateContentPosition: updatePopoverPosition
            }, content: React.createElement(SidePanel, { variant: cx({
                    left,
                    right
                }), content: React.createElement("div", { onKeyUp: onKeyUp }, content), closeButtonProps: {
                    onClick: onCloseButtonClick
                } }) })));
    }
};
//# sourceMappingURL=button-controller.js.map