import * as React from "react";
import NodeLayerController0, {
  Props as NodeLayerController0Props,
} from "./layer-controller";
import {
  _e186b96e4079Props,
  _ec3f9b216704Props,
  _5a14767c667Props,
  _e387963e7248Props,
  _e387963e1284Props,
  _a6fd80837Props,
  _8bf103e27Props,
  _10f7fc1a7Props,
  _724c3c9e7Props,
  _bc641d4113153Props,
  _28fcc84635Props,
} from "../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseNodeLayerProps = {} & _d3bf183b20Props;

export type _80203983Props = NodeLayerController0Props;
export const NodeLayer: (
  props: NodeLayerController0Props
) => React.ReactElement<NodeLayerController0Props>;

export type BaseBaseLayerProps = {
  variant?: string;
  label?: any;
  arrowProps?: _e186b96e4079Props;
  infoProps?: ElementProps;
  iconProps?: ElementProps;
  colorPaletteIconProps?: _ec3f9b216704Props;
  folderIconProps?: _5a14767c667Props;
  dottedBoxIconProps?: _e387963e7248Props;
  replaceIconProps?: _e387963e1284Props;
  fileIconProps?: _a6fd80837Props;
  squareIconProps?: _8bf103e27Props;
  circleIconProps?: _10f7fc1a7Props;
  componentIconProps?: _724c3c9e7Props;
  textIconProps?: _bc641d4113153Props;
  shadowIconProps?: _28fcc84635Props;
  labelProps?: TextProps;
  labelInputProps?: ElementProps;
  componentProps?: ElementProps;
  shadowProps?: ElementProps;
  slotProps?: ElementProps;
  elementProps?: ElementProps;
  instanceProps?: ElementProps;
  expandedProps?: ElementProps;
  altProps?: ElementProps;
  fileProps?: ElementProps;
  selectedProps?: ElementProps;
  editingLabelProps?: ElementProps;
  hoverProps?: ElementProps;
  inShadowProps?: ElementProps;
  plugProps?: ElementProps;
  headerProps?: ElementProps;
  folderProps?: ElementProps;
  unlabeledProps?: ElementProps;
  styleMixinProps?: ElementProps;
  textProps?: ElementProps;
  pcLayerProps?: ElementProps;
} & ElementProps;

export type _d3bf183b20Props = BaseBaseLayerProps;

export const BaseLayer: (
  props: BaseBaseLayerProps
) => React.ReactElement<BaseBaseLayerProps>;
