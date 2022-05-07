import * as React from "react";
import { _b6c162d113Props } from "../../../../../../../pane/view.pc";
import { _f27782548182Props } from "../../../../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseStylePropsProps = {
  elementProps?: _eace5ea811965Props;
  elementProps1?: _eace5ea811965Props;
  elementProps2?: _eace5ea811965Props;
  elementProps3?: _eace5ea811965Props;
  elementProps4?: _eace5ea811965Props;
  elementProps5?: _eace5ea811965Props;
} & ElementProps;

export type _eace5ea811950Props = BaseStylePropsProps;

export const StyleProps: (
  props: BaseStylePropsProps
) => React.ReactElement<BaseStylePropsProps>;

export type BaseStylePropRowProps = {
  variant?: string;
  propertyProps?: ElementProps;
  textProps?: TextProps;
  valueProps?: ElementProps;
  textProps1?: TextProps;
  altProps?: ElementProps;
  isOverrideProps?: ElementProps;
  isVariantProps?: ElementProps;
  isInheritedProps?: ElementProps;
} & ElementProps;

export type _eace5ea811965Props = BaseStylePropRowProps;

export const StylePropRow: (
  props: BaseStylePropRowProps
) => React.ReactElement<BaseStylePropRowProps>;

export type BaseStyleInspectorProps = {
  paneProps?: _b6c162d113Props;
  elementProps?: ElementProps;
  textProps?: TextProps;
  elementProps1?: ElementProps;
  plusIconProps?: _f27782548182Props;
  stylePropsProps?: _eace5ea811950Props;
} & ElementProps;

export type _850332f711267Props = BaseStyleInspectorProps;

export const StyleInspector: (
  props: BaseStyleInspectorProps
) => React.ReactElement<BaseStyleInspectorProps>;
