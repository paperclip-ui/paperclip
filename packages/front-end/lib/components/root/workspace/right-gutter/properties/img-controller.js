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
import { imageSourceInputChanged, imageBrowseButtonClicked } from "../../../../../actions";
export default (Base) => class ImgPropertyController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPathChangeComplete = (value) => {
            this.props.dispatch(imageSourceInputChanged(value));
        };
        this.onUploadButtonClick = () => {
            this.props.dispatch(imageBrowseButtonClicked());
        };
    }
    render() {
        const _a = this.props, { baseName, sourceNode } = _a, rest = __rest(_a, ["baseName", "sourceNode"]);
        const { onUploadButtonClick, onPathChangeComplete } = this;
        if (baseName !== "img") {
            return null;
        }
        return (React.createElement(Base, Object.assign({}, rest, { pathInputProps: {
                value: sourceNode.attributes.src,
                onChangeComplete: onPathChangeComplete
            }, uploadButtonProps: {
                onClick: onUploadButtonClick
            } })));
    }
};
//# sourceMappingURL=img-controller.js.map