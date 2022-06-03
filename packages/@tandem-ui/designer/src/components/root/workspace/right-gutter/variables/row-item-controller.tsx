import * as React from "react";
import cx from "classnames";
import { Dispatch } from "redux";
import { PCVariable, PCVariableType } from "@paperclip-lang/core";
import { BaseVariableRowItemProps } from "./view.pc";
import { DropdownMenuOption } from "../../../../inputs/dropdown/controller";
import {
  variableLabelChangeCompleted,
  variableValueChanged,
  variableValueChangeCompleted,
} from "../../../../../actions";
import { EMPTY_ARRAY } from "tandem-common";
import { FontFamily } from "../../../../../state";
import { getFontFamilyOptions } from "../styles/pretty/panes/typography-controller";

export type Props = {
  alt: boolean;
  dispatch: Dispatch<any>;
  variable: PCVariable;
  fontFamilies: FontFamily[];
};

export default (Base: React.ComponentClass<BaseVariableRowItemProps>) =>
  class VariableRowItemController extends React.PureComponent<Props> {
    onValueChange = (value) => {
      this.props.dispatch(variableValueChanged(this.props.variable, value));
    };
    onValueChangeComplete = (value) => {
      this.props.dispatch(
        variableValueChangeCompleted(this.props.variable, value)
      );
    };
    onLabelChangeComplete = (value) => {
      this.props.dispatch(
        variableLabelChangeCompleted(this.props.variable, value)
      );
    };
    render() {
      const { onValueChange, onValueChangeComplete, onLabelChangeComplete } =
        this;
      const { variable, fontFamilies, alt, ...rest } = this.props;
      const limited = variable.type === PCVariableType.FONT;
      const color = variable.type === PCVariableType.COLOR;
      const unlimited =
        variable.type === PCVariableType.NUMBER ||
        variable.type === PCVariableType.UNIT ||
        variable.type === PCVariableType.TEXT;

      let limitedOptions: DropdownMenuOption[] = EMPTY_ARRAY;

      if (variable.type === PCVariableType.FONT) {
        limitedOptions = getFontFamilyOptions(fontFamilies);
      }

      return (
        <Base
          {...rest}
          variant={cx({
            alt,
            unlimited,
            limited,
            color,
          })}
          limitedInputProps={{
            options: limitedOptions,
            onChange: onValueChange,
            onChangeComplete: onValueChangeComplete,
            value: variable.value,
          }}
          unlimitedInputProps={{
            onChange: onValueChange,
            onChangeComplete: onValueChangeComplete,
            value: variable.value,
          }}
          nameInputProps={{
            focus: !variable.label,
            onChangeComplete: onLabelChangeComplete,
            value: variable.label,
          }}
          colorInputProps={{
            swatchOptionGroups: EMPTY_ARRAY,
            onChange: onValueChange,
            onChangeComplete: onValueChangeComplete,
            value: variable.value,
          }}
        />
      );
    }
  };
