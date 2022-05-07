import * as React from "react";
import ColorPickerController0, {
  Props as ColorPickerController0Props
} from "./picker-controller";
import RgbaInputController0, {
  Props as RgbaInputController0Props
} from "./rgba-input-controller";
import HexInputController0, {
  Props as HexInputController0Props
} from "./hex-input-controller";
import PickerController0, {
  Props as PickerController0Props
} from "./canvas-controller";
import ColorSwatchesController0, {
  Props as ColorSwatchesController0Props
} from "./color-swatch-controller";
import { _7149f8199122Props } from "../text/view.pc";
import { _50e32bec2591Props } from "../dropdown/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseColorPickerProps = {
  variant?: string;
  inputsProps?: ElementProps;
  hslProps: _41979411419193Props;
  spectrumProps: _41979411419193Props;
  opacityProps: _41979411419193Props;
  rgbaInputProps: _d227ff68422143Props;
  colorSwatchesProps: _dc9a302c2Props;
  noSwatchesProps?: ElementProps;
  gradientProps?: ElementProps;
  noTabsProps?: ElementProps;
} & ElementProps;

export type _67e386c762Props = ColorPickerController0Props;
export const ColorPicker: (
  props: ColorPickerController0Props
) => React.ReactElement<ColorPickerController0Props>;

export type BaseRgbaInputProps = {
  labelProps?: TextProps;
  rInputProps: _7149f8199122Props;
  gInputProps: _7149f8199122Props;
  bInputProps: _7149f8199122Props;
  aInputProps: _7149f8199122Props;
} & ElementProps;

export type _d227ff68422143Props = RgbaInputController0Props;
export const RgbaInput: (
  props: RgbaInputController0Props
) => React.ReactElement<RgbaInputController0Props>;

export type BaseHslInputProps = {
  labelProps?: TextProps;
  rInputProps: _7149f8199122Props;
  gInputProps: _7149f8199122Props;
  aInputProps: _7149f8199122Props;
  aInputProps1: _7149f8199122Props;
} & ElementProps;

export type _d227ff68507402Props = BaseHslInputProps;

export const HslInput: (
  props: BaseHslInputProps
) => React.ReactElement<BaseHslInputProps>;

export type BaseHexInputProps = {
  labelProps?: TextProps;
  rInputProps: _7149f8199122Props;
} & ElementProps;

export type _d227ff68554496Props = HexInputController0Props;
export const HexInput: (
  props: HexInputController0Props
) => React.ReactElement<HexInputController0Props>;

export type BaseGrabberProps = {} & ElementProps;

export type _5c08964d24625Props = BaseGrabberProps;

export const Grabber: (
  props: BaseGrabberProps
) => React.ReactElement<BaseGrabberProps>;

export type BaseSliderProps = {} & _5c08964d24625Props;

export type _5c08964d900983Props = BaseSliderProps;

export const Slider: (
  props: BaseSliderProps
) => React.ReactElement<BaseSliderProps>;

export type BasePickerProps = {
  canvasContainerProps?: ElementProps;
  canvasProps?: ElementProps;
  grabberProps?: _5c08964d24625Props;
} & ElementProps;

export type _41979411419193Props = PickerController0Props;
export const Picker: (
  props: PickerController0Props
) => React.ReactElement<PickerController0Props>;

export type BaseColorSwatchesProps = {
  variant?: string;
  content?: any;
  swatchSourceInputProps: _50e32bec2591Props;
  elementProps?: ElementProps;
  elementProps1?: ElementProps;
  hasMultipleGroupsProps?: ElementProps;
} & ElementProps;

export type _dc9a302c2Props = ColorSwatchesController0Props;
export const ColorSwatches: (
  props: ColorSwatchesController0Props
) => React.ReactElement<ColorSwatchesController0Props>;

export type BaseColorSwatchItemProps = {
  variant?: string;
  pillProps?: ElementProps;
  selectedProps?: ElementProps;
} & ElementProps;

export type _b9d1103b2Props = BaseColorSwatchItemProps;

export const ColorSwatchItem: (
  props: BaseColorSwatchItemProps
) => React.ReactElement<BaseColorSwatchItemProps>;
