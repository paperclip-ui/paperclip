import * as React from "react";
import { stringifyStyle, EMPTY_OBJECT } from "tandem-common";
import { rawCssTextChanged } from "../../../../../../../actions";
import { BaseCodeProps } from "./code.pc";
import { Dispatch } from "redux";
import { SyntheticElement, ComputedStyleInfo } from "paperclip";

export type Props = {
  dispatch: Dispatch<any>;
  computedStyleInfo: ComputedStyleInfo;
};

export type InnerProps = {
  onChange: any;
} & Props;

export default (Base: React.ComponentClass<BaseCodeProps>) =>
  class CodeController extends React.PureComponent<Props> {
    onChange = (value) => {
      this.props.dispatch(rawCssTextChanged(value));
    };

    render() {
      const { onChange } = this;
      const { computedStyleInfo, ...rest } = this.props;
      const cssText = getSelectedNodeStyle(computedStyleInfo);
      return (
        <Base
          {...rest}
          textareaProps={{
            value: cssText,
            onChange,
          }}
        />
      );
    }
  };

const getSelectedNodeStyle = (info: ComputedStyleInfo) => {
  return (
    info &&
    stringifyStyle(info.style || EMPTY_OBJECT)
      .split(";")
      .join(";\n")
  );
};
