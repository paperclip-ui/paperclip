import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseNodeOverlayProps = {
  labelContainerProps?: ElementProps;
  labelProps?: TextProps;
} & ElementProps;

export type _7a40476a1359Props = BaseNodeOverlayProps;

export const NodeOverlay: (
  props: BaseNodeOverlayProps
) => React.ReactElement<BaseNodeOverlayProps>;
