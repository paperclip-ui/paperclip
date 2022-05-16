import * as React from "react";
import { BaseSpacingInputProps } from "./spacing.pc";
import { memoize } from "tandem-common";

export enum Side {
  LEFT = "left",
  TOP = "top",
  RIGHT = "right",
  BOTTOM = "bottom",
}
export type Props = {
  selectedId: string;
  left: string;
  right: string;
  top: string;
  bottom: string;
  onSideChange: any;
  onSideChangeComplete: any;
};

export default (Base: React.ComponentClass<BaseSpacingInputProps>) =>
  class SpacingInputController extends React.PureComponent<Props> {
    onPrimaryChange = (value) => {
      this.props.onSideChange(Side.LEFT, value);
      this.props.onSideChange(Side.TOP, value);
      this.props.onSideChange(Side.RIGHT, value);
      this.props.onSideChange(Side.BOTTOM, value);
    };
    onPrimaryChangeComplete = (value) => {
      this.props.onSideChangeComplete(Side.LEFT, value);
      this.props.onSideChangeComplete(Side.TOP, value);
      this.props.onSideChangeComplete(Side.RIGHT, value);
      this.props.onSideChangeComplete(Side.BOTTOM, value);
    };

    render() {
      const { onPrimaryChange, onPrimaryChangeComplete } = this;
      const {
        onSideChange,
        selectedId,
        onSideChangeComplete,
        left,
        top,
        right,
        bottom,
        ...rest
      } = this.props;
      const connected = left === top && left === right && left === bottom;
      return (
        <Base
          {...rest}
          connected={connected}
          selectedId={selectedId}
          primaryInputProps={{
            value: connected ? left : null,
            onChange: onPrimaryChange,
            onChangeComplete: onPrimaryChangeComplete,
          }}
          leftInputProps={{
            value: left,
            onChange: sideChangeCallback(onSideChange, Side.LEFT),
            onChangeComplete: sideChangeCallback(
              onSideChangeComplete,
              Side.LEFT
            ),
          }}
          topInputProps={{
            value: top,
            onChange: sideChangeCallback(onSideChange, Side.TOP),
            onChangeComplete: sideChangeCallback(
              onSideChangeComplete,
              Side.TOP
            ),
          }}
          rightInputProps={{
            value: right,
            onChange: sideChangeCallback(onSideChange, Side.RIGHT),
            onChangeComplete: sideChangeCallback(
              onSideChangeComplete,
              Side.RIGHT
            ),
          }}
          bottomInputProps={{
            value: bottom,
            onChange: sideChangeCallback(onSideChange, Side.BOTTOM),
            onChangeComplete: sideChangeCallback(
              onSideChangeComplete,
              Side.BOTTOM
            ),
          }}
        />
      );
    }
  };

const sideChangeCallback = memoize((callback: any, side: Side) => (value) => {
  callback(side, value);
});
