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
export default (Base) => class ExportsNameController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            valid: true
        };
        this.onChange = value => {
            if (this.validate(value) && this.props.onChange) {
                this.props.onChange(value);
            }
        };
        this.onChangeComplete = value => {
            if (this.validate(value) && this.props.onChangeComplete) {
                this.props.onChangeComplete(value);
            }
        };
    }
    validate(value) {
        const valid = !value || this.props.validRegexp.test(value);
        this.setState(Object.assign(Object.assign({}, this.state), { valid }));
        return valid;
    }
    render() {
        const _a = this.props, { validRegexp, errorMessage } = _a, rest = __rest(_a, ["validRegexp", "errorMessage"]);
        const { onChange, onChangeComplete } = this;
        const { valid } = this.state;
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                invalid: !valid
            }), errorProps: { text: errorMessage }, inputProps: {
                onChange,
                onChangeComplete
            } })));
    }
};
//# sourceMappingURL=exports-name-input-controller.js.map