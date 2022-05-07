import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseInputRowProps = {} & ElementProps;

export type _2657ec412855Props = BaseInputRowProps;

export const InputRow: (
  props: BaseInputRowProps
) => React.ReactElement<BaseInputRowProps>;

export type BaseInputRowItemProps = {} & ElementProps;

export type _bcda9fb551452Props = BaseInputRowItemProps;

export const InputRowItem: (
  props: BaseInputRowItemProps
) => React.ReactElement<BaseInputRowItemProps>;
