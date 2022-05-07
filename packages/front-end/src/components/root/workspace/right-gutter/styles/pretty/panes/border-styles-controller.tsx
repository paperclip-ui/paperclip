import * as React from "react";
import cx from "classnames";
import { memoize } from "tandem-common";
import { ButtonBarOption } from "../../../../../../inputs/button-bar/controller";
import { BaseBorderStylesProps } from "./borders.pc";
import { PCVariable, ComputedStyleInfo } from "paperclip";
const {
  EmptySquareIcon,
  BordersIcon3
} = require("../../../../../../../icons/view.pc");

enum TOGGLE_OPTION {
  ALL,
  INDIVIDUAL
}

const TOGGLE_OPTIONS: ButtonBarOption[] = [
  {
    icon: <EmptySquareIcon style={{ height: "9px", width: "9px" }} />,
    value: TOGGLE_OPTION.ALL
  },
  {
    icon: <BordersIcon3 style={{ height: "9px", width: "9px" }} />,
    value: TOGGLE_OPTION.INDIVIDUAL
  }
];

export type Props = {
  globalVariables: PCVariable[];
  documentColors: string[];
  onPropertyChange: any;
  onPropertyChangeComplete: any;
  computedStyleInfo: ComputedStyleInfo;
};

type State = {
  borderStyling: TOGGLE_OPTION;
};

export default (Base: React.ComponentClass<BaseBorderStylesProps>) =>
  class BorderStylesController extends React.PureComponent<Props, State> {
    constructor(props) {
      super(props);
      const { computedStyleInfo } = props;
      this.state = {
        borderStyling:
          computedStyleInfo.style["border-left"] ||
          computedStyleInfo.style["border-right"] ||
          computedStyleInfo.style["border-top"] ||
          computedStyleInfo.style["border-bottom"]
            ? TOGGLE_OPTION.INDIVIDUAL
            : TOGGLE_OPTION.ALL
      };
    }
    setBorderStyling = (value: TOGGLE_OPTION) => {
      this.setState({ ...this.state, borderStyling: value });
    };

    onStyleToggleChangeComplete = value => {
      this.setBorderStyling(value);
    };
    render() {
      const {
        documentColors,
        onPropertyChange,
        onPropertyChangeComplete,
        computedStyleInfo,
        globalVariables,
        ...rest
      } = this.props;
      const { borderStyling } = this.state;
      const { onStyleToggleChangeComplete } = this;

      return (
        <Base
          {...rest}
          variant={cx({
            all: borderStyling === TOGGLE_OPTION.ALL,
            individual: borderStyling === TOGGLE_OPTION.INDIVIDUAL
          })}
          togglerProps={{
            value: borderStyling,
            options: TOGGLE_OPTIONS,
            onChangeComplete: onStyleToggleChangeComplete
          }}
          borderInputProps={{
            documentColors,
            globalVariables,
            value: computedStyleInfo.style.border,
            onChange: propertyChangeCallback("border", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "border",
              onPropertyChangeComplete
            )
          }}
          borderLeftInputProps={{
            documentColors,
            globalVariables,
            value: computedStyleInfo.style["border-left"],
            onChange: propertyChangeCallback("border-left", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "border-left",
              onPropertyChangeComplete
            )
          }}
          borderRightInputProps={{
            documentColors,
            globalVariables,
            value: computedStyleInfo.style["border-right"],
            onChange: propertyChangeCallback("border-right", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "border-right",
              onPropertyChangeComplete
            )
          }}
          borderTopInputProps={{
            documentColors,
            globalVariables,
            value: computedStyleInfo.style["border-top"],
            onChange: propertyChangeCallback("border-top", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "border-top",
              onPropertyChangeComplete
            )
          }}
          borderBottomInputProps={{
            documentColors,
            globalVariables,
            value: computedStyleInfo.style["border-bottom"],
            onChange: propertyChangeCallback("border-bottom", onPropertyChange),
            onChangeComplete: propertyChangeCallback(
              "border-bottom",
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
