import * as React from "react";
import { BaseVariablesInputProps, VariableRowItem } from "./view.pc";
import { Dispatch } from "redux";
import { addVariableButtonClicked } from "../../../../../actions";
import { PCVariable, PCVariableType } from "paperclip";
import { FontFamily } from "../../../../../state";

export type Props = {
  dispatch: Dispatch<any>;
  globalVariables: PCVariable[];
  fontFamilies: FontFamily[];
  show?: boolean;
};

const TYPE_OPTIONS = [
  // PCVariableType.NUMBER,
  PCVariableType.COLOR,
  PCVariableType.TEXT
  // PCVariableType.FONT

  // TODO
  // "Alias"
]
  .map(value => ({
    label: value.substr(0, 1).toUpperCase() + value.substr(1),
    value
  }))
  .filter(Boolean);

export default (Base: React.ComponentClass<BaseVariablesInputProps>) =>
  class VariablesInputController extends React.PureComponent<Props> {
    onVariableButtonClick = type => {
      this.props.dispatch(addVariableButtonClicked(type));
    };
    render() {
      const { onVariableButtonClick } = this;
      const {
        dispatch,
        globalVariables,
        show,
        fontFamilies,
        ...rest
      } = this.props;

      const items = globalVariables.map((variable, i) => {
        return (
          <VariableRowItem
            key={variable.id}
            alt={Boolean(i % 2)}
            variable={variable}
            fontFamilies={fontFamilies}
            dispatch={dispatch}
          />
        );
      });

      return (
        <Base
          {...rest}
          addVariableButtonProps={{
            options: TYPE_OPTIONS,
            onChange: onVariableButtonClick
          }}
          items={items}
        />
      );
    }
  };
