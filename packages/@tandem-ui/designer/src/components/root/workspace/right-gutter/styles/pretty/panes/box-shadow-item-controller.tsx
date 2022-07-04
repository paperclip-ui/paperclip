import * as React from "react";
import cx from "classnames";
import { BaseBoxShadowItemProps } from "./box-shadow.pc";
import { PCVariable } from "@paperclip-lang/core";
import { getPrettyPaneColorSwatchOptionGroups } from "./utils";
export type BoxShadowInfo = {
  inset: boolean;
  color: string;
  x: string;
  y: string;
  blur: string;
  spread: string;
};

export type Props = {
  onRemove: any;
  selected: boolean;
  documentColors: string[];
  value: BoxShadowInfo;
  onChange: any;
  onChangeComplete: any;
  onBackgroundClick: any;
  globalVariables: PCVariable[];
};

export default (Base: React.ComponentClass<BaseBoxShadowItemProps>) =>
  class BoxShadowItemController extends React.PureComponent<Props> {
    onColorChange = (color) => {
      const { value, onChange } = this.props;
      onChange({ ...value, color });
    };
    onColorChangeComplete = (color) => {
      const { value, onChangeComplete } = this.props;
      onChangeComplete({ ...value, color });
    };
    onXChange = (x) => {
      const { value, onChange } = this.props;
      onChange({ ...value, x });
    };
    onXChangeComplete = (x) => {
      const { value, onChangeComplete } = this.props;
      onChangeComplete({ ...value, x });
    };
    onYChange = (y) => {
      const { value, onChange } = this.props;
      onChange({ ...value, y });
    };
    onYChangeComplete = (y) => {
      const { value, onChangeComplete } = this.props;
      onChangeComplete({ ...value, y });
    };
    onBlurChange = (blur) => {
      const { value, onChange } = this.props;
      onChange({ ...value, blur });
    };
    onBlurChangeComplete = (blur) => {
      const { value, onChangeComplete } = this.props;
      onChangeComplete({ ...value, blur });
    };
    onSpreadChange = (spread) => {
      const { value, onChange } = this.props;
      onChange({ ...value, spread });
    };
    onSpreadChangeComplete = (spread) => {
      const { value, onChangeComplete } = this.props;
      onChangeComplete({ ...value, spread });
    };

    render() {
      const {
        value: { color, x, y, blur, spread },
        selected,
        documentColors,
        onChange,
        onChangeComplete,
        onBackgroundClick,
        globalVariables,
        onRemove,
        ...rest
      } = this.props;
      const {
        onColorChange,
        onColorChangeComplete,
        onXChange,
        onXChangeComplete,
        onYChange,
        onYChangeComplete,
        onBlurChange,
        onBlurChangeComplete,
        onSpreadChange,
        onSpreadChangeComplete,
      } = this;
      return (
        <Base
          {...rest}
          variant={cx({ selected })}
          removeButtonProps={{
            onClick: onRemove,
          }}
          colorInputProps={{
            value: color,
            swatchOptionGroups: getPrettyPaneColorSwatchOptionGroups(
              documentColors,
              globalVariables
            ),
            onClick: stopPropagation,
            onChange: onColorChange,
            onChangeComplete: onColorChangeComplete,
          }}
          xInputProps={{
            value: x,
            onClick: stopPropagation,
            onChange: onXChange,
            onChangeComplete: onXChangeComplete,
          }}
          yInputProps={{
            value: y,
            onClick: stopPropagation,
            onChange: onYChange,
            onChangeComplete: onYChangeComplete,
          }}
          blurInputProps={{
            value: blur,
            onClick: stopPropagation,
            onChange: onBlurChange,
            onChangeComplete: onBlurChangeComplete,
          }}
          spreadInputProps={{
            value: spread,
            onClick: stopPropagation,
            onChange: onSpreadChange,
            onChangeComplete: onSpreadChangeComplete,
          }}
        />
      );
    }
  };

const stopPropagation = (event) => event.stopPropagation();
