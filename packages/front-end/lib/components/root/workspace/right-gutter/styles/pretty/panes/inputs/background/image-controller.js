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
import { memoize } from "tandem-common";
import { CSSBackgroundType } from "./state";
export default (Base) => class BackgroundImagePickerController extends React.PureComponent {
    render() {
        const _a = this.props, { cwd, value, onChange, onChangeComplete } = _a, rest = __rest(_a, ["cwd", "value", "onChange", "onChangeComplete"]);
        return (React.createElement(Base, Object.assign({}, rest, { fileUriPickerProps: {
                cwd,
                value: value.uri,
                onChangeComplete: getChangeHandler(value, "uri", onChangeComplete)
            }, repeatInputProps: {
                value: value.repeat,
                onChangeComplete: getChangeHandler(value, "repeat", onChangeComplete)
            }, positionInputProps: {
                value: value.position,
                onChangeComplete: getChangeHandler(value, "position", onChangeComplete)
            }, sizeInputProps: {
                value: value.size,
                onChangeComplete: getChangeHandler(value, "size", onChangeComplete)
            } })));
    }
};
const getChangeHandler = memoize((image, property, callback) => value => {
    callback(Object.assign(Object.assign({}, image), { type: CSSBackgroundType.IMAGE, [property]: value }));
});
//# sourceMappingURL=image-controller.js.map