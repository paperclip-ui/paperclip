var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import { OpenFileContext } from "../../../components/contexts";
export default (Base) => class FileInputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            _value: this.props.value,
            value: this.props.value
        };
        this.onBrowseButtonClick = () => __awaiter(this, void 0, void 0, function* () {
            const filePath = yield this._openFile({
                name: "Open Image",
                extensions: ["jpg", "png", "svg", "gif", "jpeg"]
            });
            const modulePath = filePath.replace(this.props.cwd, "").substr(1);
            this.onFileUriChange(modulePath);
        });
        this.onFilePathInputChange = fileUri => {
            this.onFileUriChange(fileUri);
        };
        this.onFileUriChange = (fileUri) => {
            this.setState({
                value: fileUri
            }, () => {
                if (this.props.onChangeComplete) {
                    this.props.onChangeComplete(fileUri);
                }
            });
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        let state = prevState;
        if (nextProps.value != prevState._value) {
            state = Object.assign(Object.assign({}, state), { _value: nextProps.value, value: nextProps.value });
        }
        return state === prevState ? null : state;
    }
    render() {
        const { value } = this.state;
        const { onBrowseButtonClick, onFilePathInputChange } = this;
        const _a = this.props, { onChangeComplete } = _a, rest = __rest(_a, ["onChangeComplete"]);
        return (React.createElement(OpenFileContext.Consumer, null, openFile => {
            this._openFile = openFile;
            return (React.createElement(Base, Object.assign({}, rest, { browseButtonProps: {
                    onClick: onBrowseButtonClick
                }, filePathInputProps: {
                    value,
                    onChange: onFilePathInputChange
                } })));
        }));
    }
};
//# sourceMappingURL=controller.js.map