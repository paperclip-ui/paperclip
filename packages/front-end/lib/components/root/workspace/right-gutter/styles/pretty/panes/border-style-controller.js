import * as React from "react";
import { dropdownMenuOptionFromValue } from "../../../../../../inputs/dropdown/controller";
import { memoize, EMPTY_ARRAY } from "tandem-common";
import { getPrettyPaneColorSwatchOptionGroups } from "./utils";
const STYLE_OPTIONS = [
    undefined,
    "solid",
    "dotted",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "initial",
    "inherit",
    "hidden",
    "none"
].map(dropdownMenuOptionFromValue);
export default (Base) => class BorderStyleController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onStyleChangeComplete = style => {
            this.props.onChangeComplete(stringifyBorderInfo(Object.assign(Object.assign({}, parseBorder(this.props.value)), { style })));
        };
        this.onColorChange = color => {
            this.props.onChange(stringifyBorderInfo(Object.assign(Object.assign({}, parseBorder(this.props.value)), { color })));
        };
        this.onColorChangeComplete = color => {
            this.props.onChangeComplete(stringifyBorderInfo(Object.assign(Object.assign({}, parseBorder(this.props.value)), { color })));
        };
        this.onThicknessChange = thickness => {
            this.props.onChange(stringifyBorderInfo(Object.assign(Object.assign({}, parseBorder(this.props.value)), { thickness })));
        };
        this.onThicknessChangeComplete = thickness => {
            this.props.onChangeComplete(stringifyBorderInfo(Object.assign(Object.assign({}, parseBorder(this.props.value)), { thickness })));
        };
    }
    render() {
        const { value, documentColors, globalVariables } = this.props;
        const { onColorChange, onColorChangeComplete, onStyleChangeComplete, onThicknessChange, onThicknessChangeComplete } = this;
        if (!documentColors) {
            return null;
        }
        const { style, color, thickness } = parseBorder(value);
        return (React.createElement(Base, { colorInputProps: {
                swatchOptionGroups: getPrettyPaneColorSwatchOptionGroups(documentColors, globalVariables),
                value: color,
                onChange: onColorChange,
                onChangeComplete: onColorChangeComplete
            }, styleInputProps: {
                value: style,
                options: STYLE_OPTIONS,
                onChangeComplete: onStyleChangeComplete
            }, thicknessInputProps: {
                value: thickness,
                onChange: onThicknessChange,
                onChangeComplete: onThicknessChangeComplete
            } }));
    }
};
const parseBorder = memoize((value = "") => ({
    style: (String(value).match(/(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|initial|inherit)/) || EMPTY_ARRAY)[1],
    color: (String(value).match(/(#\w+|\w+\(.*?\))/) || EMPTY_ARRAY)[1],
    thickness: (String(value).match(/(\d+px)/) || EMPTY_ARRAY)[1]
}), 100);
const stringifyBorderInfo = (info) => [info.thickness || "0px", info.style, info.color].join(" ").trim();
//# sourceMappingURL=border-style-controller.js.map