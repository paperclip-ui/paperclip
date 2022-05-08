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
import { browseDirectoryClicked } from "../actions";
export default (Base) => { var _a; return _a = class FormController extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.state = {
                directory: null,
                _directory: null
            };
            this.onCreateButtonClick = () => {
                if (!this.isValid()) {
                    return null;
                }
                this.props.onChangeComplete({
                    directory: this.state.directory
                });
            };
            this.onBrowserDirectoryClick = () => {
                this.props.dispatch(browseDirectoryClicked());
            };
            this.onDirectoryChange = directory => {
                this.setState(Object.assign(Object.assign({}, this.state), { directory }));
            };
            this.isValid = () => {
                return this.state.directory != null;
            };
        }
        render() {
            const { onBrowserDirectoryClick, onDirectoryChange, onCreateButtonClick } = this;
            const _a = this.props, { template } = _a, rest = __rest(_a, ["template"]);
            const { directory } = this.state;
            const valid = this.isValid();
            return (React.createElement(Base, Object.assign({}, rest, { titleProps: {
                    text: `New ${template.label} Project`
                }, directoryInputProps: {
                    value: directory,
                    onChange: onDirectoryChange
                }, browseButtonProps: {
                    onClick: onBrowserDirectoryClick
                }, createProjectButtonProps: {
                    variant: cx({
                        disabled: !valid
                    }),
                    onClick: onCreateButtonClick
                } })));
        }
    },
    _a.getDerivedStateFromProps = (props, state) => {
        let newState = state;
        if (props.selectedDirectory &&
            props.selectedDirectory !== state._directory) {
            newState = Object.assign(Object.assign({}, newState), { _directory: props.selectedDirectory, directory: props.selectedDirectory });
        }
        return newState !== state ? newState : null;
    },
    _a; };
//# sourceMappingURL=form-controller.js.map