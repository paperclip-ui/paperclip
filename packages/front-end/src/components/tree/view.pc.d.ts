import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseTreeProps = {} & ElementProps;

export type _b34e7ef44413Props = BaseTreeProps;

export const Tree: (props: BaseTreeProps) => React.ReactElement<BaseTreeProps>;

export type BaseNodeProps = {
  insertBeforeLineProps?: _b34e7ef41152456Props;
  labelProps?: _b34e7ef4135181Props;
  childrenProps?: ElementProps;
  insertAfterLineProps?: _b34e7ef41152456Props;
} & ElementProps;

export type _b34e7ef429680Props = BaseNodeProps;

export const Node: (props: BaseNodeProps) => React.ReactElement<BaseNodeProps>;

export type BaseNodeLabelProps = {
  textProps?: TextProps;
} & ElementProps;

export type _b34e7ef4135181Props = BaseNodeLabelProps;

export const NodeLabel: (
  props: BaseNodeLabelProps
) => React.ReactElement<BaseNodeLabelProps>;

export type BaseInsertLineProps = {} & ElementProps;

export type _b34e7ef41152456Props = BaseInsertLineProps;

export const InsertLine: (
  props: BaseInsertLineProps
) => React.ReactElement<BaseInsertLineProps>;
