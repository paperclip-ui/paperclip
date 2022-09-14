import * as React from "react";
import { dropdownMenuOptionFromValue } from "../../../../../../inputs/dropdown/controller";
import { memoize, EMPTY_ARRAY } from "tandem-common";
import { BaseBorderStyleProps } from "./borders.pc";
import { mapPCVariablesToColorSwatchOptions } from "../../state";
import { PCVariable } from "@paperclip-lang/core";
import { getColorSwatchOptionsFromValues } from "../../../../../../inputs/color/color-swatch-controller";
import { getPrettyPaneColorSwatchOptionGroups } from "./utils";

const STYLE_OPTIONS = [
  undefined,
  "solid",
  "dotted",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset",
  "initial",
  "inherit",
  "hidden",
  "none",
].map(dropdownMenuOptionFromValue);

type BorderInfo = {
  style: string;
  color: string;
  thickness: string;
};

export type Props = {
  documentColors: string[];
  value: string;
  onChange: any;
  onChangeComplete: any;
  globalVariables: PCVariable[];
};

export default (Base: React.ComponentClass<BaseBorderStyleProps>) =>
  class BorderStyleController extends React.PureComponent<Props> {
    onStyleChangeComplete = (style) => {
      this.props.onChangeComplete(
        stringifyBorderInfo({ ...parseBorder(this.props.value), style })
      );
    };
    onColorChange = (color) => {
      this.props.onChange(
        stringifyBorderInfo({ ...parseBorder(this.props.value), color })
      );
    };
    onColorChangeComplete = (color) => {
      this.props.onChangeComplete(
        stringifyBorderInfo({ ...parseBorder(this.props.value), color })
      );
    };
    onThicknessChange = (thickness) => {
      this.props.onChange(
        stringifyBorderInfo({ ...parseBorder(this.props.value), thickness })
      );
    };
    onThicknessChangeComplete = (thickness) => {
      this.props.onChangeComplete(
        stringifyBorderInfo({ ...parseBorder(this.props.value), thickness })
      );
    };
    render() {
      const { value, documentColors, globalVariables } = this.props;
      const {
        onColorChange,
        onColorChangeComplete,
        onStyleChangeComplete,
        onThicknessChange,
        onThicknessChangeComplete,
      } = this;

      if (!documentColors) {
        return null;
      }

      const { style, color, thickness } = parseBorder(value);
      return (
        <Base
          colorInputProps={{
            swatchOptionGroups: getPrettyPaneColorSwatchOptionGroups(
              documentColors,
              globalVariables
            ),
            value: color,
            onChange: onColorChange,
            onChangeComplete: onColorChangeComplete,
          }}
          styleInputProps={{
            value: style,
            options: STYLE_OPTIONS,
            onChangeComplete: onStyleChangeComplete,
          }}
          thicknessInputProps={{
            value: thickness,
            onChange: onThicknessChange,
            onChangeComplete: onThicknessChangeComplete,
          }}
        />
      );
    }
  };

const parseBorder = memoize(
  (value = "") => ({
    style: (String(value).match(
      /(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|initial|inherit)/
    ) || EMPTY_ARRAY)[1],
    color: (String(value).match(/(#\w+|\w+\(.*?\))/) || EMPTY_ARRAY)[1],
    thickness: (String(value).match(/(\d+px)/) || EMPTY_ARRAY)[1],
  }),
  100
);

const stringifyBorderInfo = (info: BorderInfo) =>
  [info.thickness || "0px", info.style, info.color].join(" ").trim();
