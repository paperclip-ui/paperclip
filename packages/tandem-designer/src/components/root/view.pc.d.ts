import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseAppProps = {} & ElementProps;

export type _8d443eb51250574Props = BaseAppProps;

export const App: (props: BaseAppProps) => React.ReactElement<BaseAppProps>;
