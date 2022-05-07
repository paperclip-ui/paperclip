import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseTodoProps = {
  elementProps?: ElementProps;
  elementProps1?: ElementProps;
  textProps?: TextProps;
} & _97a34b151010442Props;

export type _d6261ad5198Props = BaseTodoProps;

export const Todo: (props: BaseTodoProps) => React.ReactElement<BaseTodoProps>;

export type BaseCommentProps = {
  elementProps?: ElementProps;
  elementProps1?: ElementProps;
  textProps?: TextProps;
} & ElementProps;

export type _97a34b151010442Props = BaseCommentProps;

export const Comment: (
  props: BaseCommentProps
) => React.ReactElement<BaseCommentProps>;
