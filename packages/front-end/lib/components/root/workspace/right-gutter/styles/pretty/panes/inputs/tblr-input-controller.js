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
import { EmptySquareIcon, BordersIcon3 } from "../../../../../../../../icons/view.pc";
import { memoize } from "tandem-common";
export default (Base) => class TBLRController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            connected: this.props.connected,
            selectedId: this.props.selectedId
        };
        this.onToggleOptionChange = (connected) => {
            this.setState({ connected });
        };
    }
    static getDerivedStateFromProps(props, state) {
        if (props.selectedId !== state.selectedId) {
            return Object.assign(Object.assign({}, state), { connected: props.connected, selectedId: props.selectedId });
        }
        return null;
    }
    render() {
        const { onToggleOptionChange } = this;
        const { connected } = this.state;
        const _a = this.props, { connectedIcon, disconnectedIcon } = _a, rest = __rest(_a, ["connectedIcon", "disconnectedIcon"]);
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                connected,
                disconnected: !connected
            }), primaryInputProps: null, firstInputProps: null, secondInputProps: null, thirdInputProps: null, fourthInputProps: null, togglerProps: {
                value: connected,
                options: getButtonBarOptions(connectedIcon, disconnectedIcon),
                onChangeComplete: onToggleOptionChange
            } })));
    }
};
const getButtonBarOptions = memoize((connectedIcon, disconnectedIcon) => [
    {
        icon: connectedIcon || (React.createElement(EmptySquareIcon, { style: { height: "9px", width: "9px" } })),
        value: true
    },
    {
        icon: disconnectedIcon || (React.createElement(BordersIcon3, { style: { height: "9px", width: "9px" } })),
        value: false
    }
]);
//# sourceMappingURL=tblr-input-controller.js.map