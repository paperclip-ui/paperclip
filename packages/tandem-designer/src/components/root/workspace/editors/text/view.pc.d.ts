import * as React from "react";
import { _9f364d2139415Props } from "../../../../inputs/button/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseTextPreviewProps = {
  bannerProps?: ElementProps;
  textProps?: TextProps;
  ctaProps?: ElementProps;
  openTextEditorButtonProps?: _9f364d2139415Props;
  contentProps?: ElementProps;
  innerProps?: ElementProps;
  textProps1?: TextProps;
} & ElementProps;

export type _5c9686b814979Props = BaseTextPreviewProps;

export const TextPreview: (
  props: BaseTextPreviewProps
) => React.ReactElement<BaseTextPreviewProps>;
