import * as React from "react";
import EditorFooterController0, {
  Props as EditorFooterController0Props,
} from "./controller";
import BreadcrumbsController0, {
  Props as BreadcrumbsController0Props,
} from "./breadcrumbs-controller";
import {
  _e387963e1284Props,
  _28fcc84635Props,
  _724c3c9e7Props,
  _8bf103e27Props,
  _bc641d4113153Props,
  _e387963e7248Props,
} from "../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseEditorFooterProps = {
  zoomProps?: ElementProps;
  zoomProps1?: TextProps;
  zoomPercentageProps?: TextProps;
  breadcrumbsProps: _5dee72436Props;
} & ElementProps;

export type _174f96bb76034Props = EditorFooterController0Props;
export const EditorFooter: (
  props: EditorFooterController0Props
) => React.ReactElement<EditorFooterController0Props>;

export type BaseBreadcrumbsProps = {
  items?: any;
} & ElementProps;

export type _5dee72436Props = BreadcrumbsController0Props;
export const Breadcrumbs: (
  props: BreadcrumbsController0Props
) => React.ReactElement<BreadcrumbsController0Props>;

export type BaseBreadcrumbProps = {
  variant?: string;
  labelContainerProps?: ElementProps;
  iconProps?: ElementProps;
  replaceIconProps?: _e387963e1284Props;
  shadowIconProps?: _28fcc84635Props;
  componentIconProps?: _724c3c9e7Props;
  emptySquareIconProps?: _8bf103e27Props;
  textIconProps?: _bc641d4113153Props;
  dottedBoxIconProps?: _e387963e7248Props;
  labelProps?: TextProps;
  arrowContainerProps?: ElementProps;
  arrowProps?: ElementProps;
  componentProps?: ElementProps;
  shadowProps?: ElementProps;
  textProps?: ElementProps;
  elementProps?: ElementProps;
  plugProps?: ElementProps;
  slotProps?: ElementProps;
  hoveringProps?: ElementProps;
  selectedProps?: ElementProps;
} & ElementProps;

export type _5dee724311Props = BaseBreadcrumbProps;

export const Breadcrumb: (
  props: BaseBreadcrumbProps
) => React.ReactElement<BaseBreadcrumbProps>;
