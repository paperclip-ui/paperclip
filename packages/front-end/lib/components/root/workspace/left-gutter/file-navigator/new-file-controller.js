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
import * as ReactDOM from "react-dom";
import { FocusComponent } from "../../../../focus";
import scrollIntoView from "scroll-into-view-if-needed";
export default (Base) => class NewFileInputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onBlur = (event) => {
            if (!event.target.value) {
                if (this.props.onEscape) {
                    this.props.onEscape();
                }
                return;
            }
            this.props.onChangeComplete(event.target.value);
        };
        this.onKeyDown = (event) => {
            const target = event.target;
            const key = event.key;
            setTimeout(() => {
                this.props.onChange(target.value);
                if (key === "Enter") {
                    this.props.onChangeComplete(target.value);
                }
                if (key === "Escape" && this.props.onEscape) {
                    this.props.onEscape();
                }
            });
        };
    }
    componentDidMount() {
        const self = ReactDOM.findDOMNode(this);
        // icky, but we're picking the label here
        scrollIntoView(self, {
            scrollMode: "if-needed"
        });
    }
    render() {
        const _a = this.props, { onChange, onChangeComplete } = _a, rest = __rest(_a, ["onChange", "onChangeComplete"]);
        const { onBlur, onKeyDown } = this;
        return (React.createElement(FocusComponent, null,
            React.createElement(Base, Object.assign({}, rest, { variant: "editingLabel", labelInputProps: { onBlur, onKeyDown: onKeyDown } }))));
    }
};
//# sourceMappingURL=new-file-controller.js.map