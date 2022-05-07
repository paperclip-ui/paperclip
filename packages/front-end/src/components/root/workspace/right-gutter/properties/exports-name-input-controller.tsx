import * as React from "react";
import cx from "classnames";
import { BaseExportNameInputProps } from "./view.pc";

export type Props = {
  value: any;
  onChange?: any;
  onChangeComplete: any;
  validRegexp: RegExp;
  errorMessage: string;
};

type State = {
  valid: boolean;
};

export default (Base: React.ComponentClass<BaseExportNameInputProps>) =>
  class ExportsNameController extends React.PureComponent<Props, State> {
    state = {
      valid: true
    };
    onChange = value => {
      if (this.validate(value) && this.props.onChange) {
        this.props.onChange(value);
      }
    };
    onChangeComplete = value => {
      if (this.validate(value) && this.props.onChangeComplete) {
        this.props.onChangeComplete(value);
      }
    };
    validate(value: string) {
      const valid = !value || this.props.validRegexp.test(value);
      this.setState({ ...this.state, valid });
      return valid;
    }
    render() {
      const { validRegexp, errorMessage, ...rest } = this.props;
      const { onChange, onChangeComplete } = this;
      const { valid } = this.state;
      return (
        <Base
          {...rest}
          variant={cx({
            invalid: !valid
          })}
          errorProps={{ text: errorMessage }}
          inputProps={{
            onChange,
            onChangeComplete
          }}
        />
      );
    }
  };
