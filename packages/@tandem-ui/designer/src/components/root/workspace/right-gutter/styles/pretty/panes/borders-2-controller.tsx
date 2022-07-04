import * as React from "react";
import { Dispatch } from "redux";
import { BaseBorders2Props } from "./borders.pc";
import { PCVariable, ComputedStyleInfo } from "@paperclip-lang/core";
import {
  cssPropertyChanged,
  cssPropertyChangeCompleted,
} from "../../../../../../../actions";

export type Props = {
  dispatch: Dispatch<any>;
  documentColors: string[];
  globalVariables: PCVariable[];
  computedStyleInfo: ComputedStyleInfo;
};

export default (Base: React.ComponentClass<BaseBorders2Props>) =>
  class Borders2Controller extends React.PureComponent<Props> {
    onPropertyChange = (name, value) => {
      this.props.dispatch(cssPropertyChanged(name, value));
    };
    onPropertyChangeComplete = (name, value) => {
      this.props.dispatch(cssPropertyChangeCompleted(name, value));
    };
    render() {
      const { onPropertyChange, onPropertyChangeComplete } = this;
      const { documentColors, globalVariables, computedStyleInfo, ...rest } =
        this.props;
      return (
        <Base
          {...rest}
          colorInputProps={{
            documentColors,
            globalVariables,
            computedStyleInfo,
            onPropertyChange,
            onPropertyChangeComplete,
          }}
          radiusInputProps={{
            computedStyleInfo,
            onPropertyChange,
            onPropertyChangeComplete,
          }}
        />
      );
    }
  };
