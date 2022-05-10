import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseBlankFormOptionsProps = {} & ElementProps;

export type _c6acc7ee889Props = BaseBlankFormOptionsProps;

export const BlankFormOptions: (
  props: BaseBlankFormOptionsProps
) => React.ReactElement<BaseBlankFormOptionsProps>;
