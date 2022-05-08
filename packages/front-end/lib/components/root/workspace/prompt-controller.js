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
import { promptConfirmed, promptCancelButtonClicked } from "../../../actions";
export const mapStateToProps = ({ prompt }) => {
    if (!prompt) {
        return null;
    }
    return {
        options: prompt
    };
};
export default (Base) => class WorkspacePromptController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onOk = (value) => {
            this.props.dispatch(value
                ? promptConfirmed(value, this.props.options.okActionType)
                : promptCancelButtonClicked());
        };
        this.onCancel = () => {
            this.props.dispatch(promptCancelButtonClicked());
        };
    }
    render() {
        const _a = this.props, { options: { label, defaultValue } } = _a, rest = __rest(_a, ["options"]);
        const { onCancel, onOk } = this;
        return (React.createElement(Base, Object.assign({}, rest, { label: label, defaultValue: defaultValue, onCancel: onCancel, onOk: onOk })));
    }
};
//# sourceMappingURL=prompt-controller.js.map