import * as React from "react";
import { BaseColorsInputProps } from "./borders.pc";
import { PCVariable, ComputedStyleInfo } from "paperclip";
import { memoize } from "tandem-common";

export type Props = {
  documentColors: string[];
  globalVariables: PCVariable[];
  computedStyleInfo: ComputedStyleInfo;
  onPropertyChange: any;
  onPropertyChangeComplete: any;
};

export default (Base: React.ComponentClass<BaseColorsInputProps>) =>
  class BorderColorInputController extends React.PureComponent<Props> {
    onPrimaryChange = (value: string) => {
      this.props.onPropertyChange("border-left", value);
      this.props.onPropertyChange("border-top", value);
      this.props.onPropertyChange("border-right", value);
      this.props.onPropertyChange("border-bottom", value);
    };
    onPrimaryChangeComplete = (value: string) => {
      this.props.onPropertyChangeComplete("border-left", value);
      this.props.onPropertyChangeComplete("border-top", value);
      this.props.onPropertyChangeComplete("border-right", value);
      this.props.onPropertyChangeComplete("border-bottom", value);
    };
    render() {
      const { onPrimaryChange, onPrimaryChangeComplete } = this;
      const {
        documentColors,
        onPropertyChange,
        onPropertyChangeComplete,
        globalVariables,
        computedStyleInfo,
        ...rest
      } = this.props;
      const connected =
        computedStyleInfo.style["border-left"] ===
          computedStyleInfo.style["border-top"] &&
        computedStyleInfo.style["border-left"] ===
          computedStyleInfo.style["border-right"] &&
        computedStyleInfo.style["border-left"] ===
          computedStyleInfo.style["border-bottom"];
      return (
        <Base
          {...rest}
          connected={connected}
          selectedId={computedStyleInfo.sourceNode.id}
          primaryInputProps={{
            value: connected ? computedStyleInfo.style["border-left"] : null,
            documentColors,
            globalVariables,
            onChange: onPrimaryChange,
            onChangeComplete: onPrimaryChangeComplete
          }}
          topInputProps={{
            value: computedStyleInfo.style["border-top"],
            documentColors,
            globalVariables,
            onChange: propertyChangeCallback("border-top", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "border-top",
              onPropertyChangeComplete
            )
          }}
          bottomInputProps={{
            value: computedStyleInfo.style["border-bottom"],
            documentColors,
            globalVariables,
            onChange: propertyChangeCallback("border-bottom", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "border-bottom",
              onPropertyChangeComplete
            )
          }}
          leftInputProps={{
            value: computedStyleInfo.style["border-left"],
            documentColors,
            globalVariables,
            onChange: propertyChangeCallback("border-left", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "border-left",
              onPropertyChangeComplete
            )
          }}
          rightInputProps={{
            value: computedStyleInfo.style["border-right"],
            documentColors,
            globalVariables,
            onChange: propertyChangeCallback("border-right", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "border-right",
              onPropertyChangeComplete
            )
          }}
        />
      );
    }
  };

const propertyChangeCallback = memoize((name: string, listener) => value =>
  listener(name, value)
);
