import * as React from "react";
import { cssPropertyChangeCompleted, cssPropertyChanged } from "../../../../../../../actions";
import { dropdownMenuOptionFromValue } from "../../../../../../inputs/dropdown/controller";
import { memoize } from "tandem-common";
const BOX_SIZING_OPTIONS = [
    undefined,
    "border-box",
    "content-box"
].map(dropdownMenuOptionFromValue);
export default (Base) => class SpacingController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onClick = () => { };
        this.onPropertyChange = (name, value) => {
            this.props.dispatch(cssPropertyChanged(name, value));
        };
        this.onPropertyChangeComplete = (name, value) => {
            this.props.dispatch(cssPropertyChangeCompleted(name, value));
        };
    }
    render() {
        const { onPropertyChange, onPropertyChangeComplete } = this;
        const { computedStyleInfo } = this.props;
        return (React.createElement(Base, { boxSizingInputProps: {
                options: BOX_SIZING_OPTIONS,
                value: computedStyleInfo.style["box-sizing"],
                onChangeComplete: propertyChangeCallback("box-sizing", onPropertyChangeComplete)
            }, marginLeftInputProps: {
                value: computedStyleInfo.style["margin-left"],
                onChange: propertyChangeCallback("margin-left", onPropertyChange),
                onChangeComplete: propertyChangeCallback("margin-left", onPropertyChangeComplete)
            }, marginTopInputProps: {
                value: computedStyleInfo.style["margin-top"],
                onChange: propertyChangeCallback("margin-top", onPropertyChange),
                onChangeComplete: propertyChangeCallback("margin-top", onPropertyChangeComplete)
            }, marginRightInputProps: {
                value: computedStyleInfo.style["margin-right"],
                onChange: propertyChangeCallback("margin-right", onPropertyChange),
                onChangeComplete: propertyChangeCallback("margin-right", onPropertyChangeComplete)
            }, marginBottomInputProps: {
                value: computedStyleInfo.style["margin-bottom"],
                onChange: propertyChangeCallback("margin-bottom", onPropertyChange),
                onChangeComplete: propertyChangeCallback("margin-bottom", onPropertyChangeComplete)
            }, paddingLeftInputProps: {
                value: computedStyleInfo.style["padding-left"],
                onChange: propertyChangeCallback("padding-left", onPropertyChange),
                onChangeComplete: propertyChangeCallback("padding-left", onPropertyChangeComplete)
            }, paddingTopInputProps: {
                value: computedStyleInfo.style["padding-top"],
                onChange: propertyChangeCallback("padding-top", onPropertyChange),
                onChangeComplete: propertyChangeCallback("padding-top", onPropertyChangeComplete)
            }, paddingRightInputProps: {
                value: computedStyleInfo.style["padding-right"],
                onChange: propertyChangeCallback("padding-right", onPropertyChange),
                onChangeComplete: propertyChangeCallback("padding-right", onPropertyChangeComplete)
            }, paddingBottomInputProps: {
                value: computedStyleInfo.style["padding-bottom"],
                onChange: propertyChangeCallback("padding-bottom", onPropertyChange),
                onChangeComplete: propertyChangeCallback("padding-bottom", onPropertyChangeComplete)
            } }));
    }
};
const propertyChangeCallback = memoize((name, listener) => value => listener(name, value));
//# sourceMappingURL=spacing-controller.js.map