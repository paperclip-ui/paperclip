import * as React from "react";
import { arraySplice } from "tandem-common";
import { clamp, noop } from "lodash";
import { BaseRgbaInputProps } from "./picker.pc";

export type Props = {
  onChange?: any;
  onChangeComplete?: any;
  value?: [number, number, number, number];
};

export default (Base: React.ComponentClass<BaseRgbaInputProps>) =>
  class RGBAInputController extends React.PureComponent<Props> {
    render() {
      const {
        onChange = noop,
        onChangeComplete = noop,
        value: [r, g, b, a] = [0, 0, 0, 0],
      } = this.props;
      const changeCallback = (index) => (value) =>
        onChange(
          arraySplice([r, g, b, a], index, 1, clamp(Number(value), 0, 255))
        );
      const changeCompleteCallback = (index) => (value) =>
        onChangeComplete(
          arraySplice([r, g, b, a], index, 1, clamp(Number(value), 0, 255))
        );
      return (
        <Base
          rInputProps={{
            value: r,
            onChange: changeCallback(0),
            onChangeComplete: changeCompleteCallback(0),
          }}
          gInputProps={{
            value: g,
            onChange: changeCallback(1),
            onChangeComplete: changeCompleteCallback(1),
          }}
          bInputProps={{
            value: b,
            onChange: changeCallback(2),
            onChangeComplete: changeCompleteCallback(2),
          }}
          aInputProps={{
            value: a,
            onChange: changeCallback(3),
            onChangeComplete: changeCompleteCallback(3),
          }}
        />
      );
    }
  };
