import * as React from "react";
import BackgroundPickerController0, {
  Props as BackgroundPickerController0Props,
} from "./controller";
import LinearGradientPickerController0, {
  Props as LinearGradientPickerController0Props,
} from "./linear-gradient-controller";
import SolidColorPickerController0, {
  Props as SolidColorPickerController0Props,
} from "./solid-controller";
import BackgroundImagePickerController0, {
  Props as BackgroundImagePickerController0Props,
} from "./image-controller";
import { _b57b95b54351Props } from "../../../../../../../../../icons/view.pc";
import { _67e386c762Props } from "../../../../../../../../inputs/color/picker.pc";
import { _7149f8192509Props } from "../../../../../../../../inputs/molecules.pc";
import { _9fb9afea1357Props } from "../../../../../../../../inputs/file-picker/view.pc";
import { _7149f8199122Props } from "../../../../../../../../inputs/text/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseBackgroundPickerProps = {
  variant?: string;
  tabsProps?: ElementProps;
  solidToggleButtonProps?: _641b17c24834Props;
  linearGradientButtonProps?: _641b17c24834Props;
  imageToggleButtonProps?: _641b17c24834Props;
  elementProps?: ElementProps;
  imageIconProps?: _b57b95b54351Props;
  solidProps?: ElementProps;
  linearGradientProps?: ElementProps;
  imageProps?: ElementProps;
  solidColorPickerProps: _641b17c22612Props;
  linearGradientPickerProps: _feaf302b1815Props;
  backgroundImagePickerProps: _641b17c23003Props;
} & ElementProps;

export type _feaf302b1678Props = BackgroundPickerController0Props;
export const BackgroundPicker: (
  props: BackgroundPickerController0Props
) => React.ReactElement<BackgroundPickerController0Props>;

export type BaseLinearGradientPickerProps = {
  controlsProps?: ElementProps;
  sliderProps?: ElementProps;
  colorStopProps?: _641b17c22220Props;
  colorStopProps1?: _641b17c22220Props;
  colorPickerProps: _67e386c762Props;
} & ElementProps;

export type _feaf302b1815Props = LinearGradientPickerController0Props;
export const LinearGradientPicker: (
  props: LinearGradientPickerController0Props
) => React.ReactElement<LinearGradientPickerController0Props>;

export type BaseColorStopProps = {} & ElementProps;

export type _641b17c22220Props = BaseColorStopProps;

export const ColorStop: (
  props: BaseColorStopProps
) => React.ReactElement<BaseColorStopProps>;

export type BaseSolidColorPickerProps = {
  colorPickerProps: _67e386c762Props;
} & ElementProps;

export type _641b17c22612Props = SolidColorPickerController0Props;
export const SolidColorPicker: (
  props: SolidColorPickerController0Props
) => React.ReactElement<SolidColorPickerController0Props>;

export type BaseBackgroundImagePickerProps = {
  labeledInputProps?: _7149f8192509Props;
  fileUriPickerProps: _9fb9afea1357Props;
  labeledInputProps1?: _7149f8192509Props;
  repeatInputProps: _7149f8199122Props;
  labeledInputProps2?: _7149f8192509Props;
  positionInputProps: _7149f8199122Props;
  labeledInputProps3?: _7149f8192509Props;
  sizeInputProps: _7149f8199122Props;
} & ElementProps;

export type _641b17c23003Props = BackgroundImagePickerController0Props;
export const BackgroundImagePicker: (
  props: BackgroundImagePickerController0Props
) => React.ReactElement<BackgroundImagePickerController0Props>;

export type BaseBackgroundTypeButtonProps = {
  variant?: string;
  icon?: any;
  solidProps?: ElementProps;
  coverProps?: ElementProps;
  selectedProps?: ElementProps;
} & ElementProps;

export type _641b17c24834Props = BaseBackgroundTypeButtonProps;

export const BackgroundTypeButton: (
  props: BaseBackgroundTypeButtonProps
) => React.ReactElement<BaseBackgroundTypeButtonProps>;
