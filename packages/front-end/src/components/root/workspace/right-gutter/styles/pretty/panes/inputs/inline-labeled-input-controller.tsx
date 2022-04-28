import * as React from "react";
import { BaseInlineLabeledInputProps } from "./view.pc";

export type Props = {
  onChange?: any;
  onChangeComplete?: any;
  value: any;
  tabIndex?: number;
  disabled?: boolean;
};

export default (Base: React.ComponentClass<BaseInlineLabeledInputProps>) =>
  class InlineLabeledInputController extends React.PureComponent<Props> {
    render() {
      const {
        value,
        tabIndex,
        disabled,
        onChange,
        onChangeComplete,
        ...rest
      } = this.props;
      return (
        <Base
          {...rest}
          textInputProps={{
            disabled,
            tabIndex,
            value,
            onChange,
            onChangeComplete
          }}
        />
      );
    }
  };
