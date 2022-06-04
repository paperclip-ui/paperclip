import * as React from "react";
import {
  cssPropertyChangeCompleted,
  cssPropertyChanged,
} from "../../../../../../../actions";
import {
  DropdownMenuOption,
  dropdownMenuOptionFromValue,
} from "../../../../../../inputs/dropdown/controller";
import { memoize } from "tandem-common";
import { ComputedStyleInfo } from "paperclip";
// import { BaseBoxModelProps } from "./spacing.pc";
import { Dispatch } from "redux";

const BOX_SIZING_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "border-box",
  "content-box",
].map(dropdownMenuOptionFromValue);

export type Props = {
  dispatch: Dispatch<any>;
  computedStyleInfo: ComputedStyleInfo;
};

export default (Base: React.ComponentClass<any>) =>
  class SpacingController extends React.PureComponent<Props> {
    onClick = () => {};
    onPropertyChange = (name, value) => {
      this.props.dispatch(cssPropertyChanged(name, value));
    };

    onPropertyChangeComplete = (name, value) => {
      this.props.dispatch(cssPropertyChangeCompleted(name, value));
    };

    render() {
      const { onPropertyChange, onPropertyChangeComplete } = this;
      const { computedStyleInfo } = this.props;
      return (
        <Base
          boxSizingInputProps={{
            options: BOX_SIZING_OPTIONS,
            value: computedStyleInfo.style["box-sizing"],
            onChangeComplete: propertyChangeCallback(
              "box-sizing",
              onPropertyChangeComplete
            ),
          }}
          marginLeftInputProps={{
            value: computedStyleInfo.style["margin-left"],
            onChange: propertyChangeCallback("margin-left", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "margin-left",
              onPropertyChangeComplete
            ),
          }}
          marginTopInputProps={{
            value: computedStyleInfo.style["margin-top"],
            onChange: propertyChangeCallback("margin-top", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "margin-top",
              onPropertyChangeComplete
            ),
          }}
          marginRightInputProps={{
            value: computedStyleInfo.style["margin-right"],
            onChange: propertyChangeCallback("margin-right", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "margin-right",
              onPropertyChangeComplete
            ),
          }}
          marginBottomInputProps={{
            value: computedStyleInfo.style["margin-bottom"],
            onChange: propertyChangeCallback("margin-bottom", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "margin-bottom",
              onPropertyChangeComplete
            ),
          }}
          paddingLeftInputProps={{
            value: computedStyleInfo.style["padding-left"],
            onChange: propertyChangeCallback("padding-left", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "padding-left",
              onPropertyChangeComplete
            ),
          }}
          paddingTopInputProps={{
            value: computedStyleInfo.style["padding-top"],
            onChange: propertyChangeCallback("padding-top", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "padding-top",
              onPropertyChangeComplete
            ),
          }}
          paddingRightInputProps={{
            value: computedStyleInfo.style["padding-right"],
            onChange: propertyChangeCallback("padding-right", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "padding-right",
              onPropertyChangeComplete
            ),
          }}
          paddingBottomInputProps={{
            value: computedStyleInfo.style["padding-bottom"],
            onChange: propertyChangeCallback(
              "padding-bottom",
              onPropertyChange
            ),
            onChangeComplete: propertyChangeCallback(
              "padding-bottom",
              onPropertyChangeComplete
            ),
          }}
        />
      );
    }
  };

const propertyChangeCallback = memoize(
  (name: string, listener) => (value) => listener(name, value)
);
