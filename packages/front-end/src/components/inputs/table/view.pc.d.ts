import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseTableCellProps = {
  variant?: string;
  content?: any;
  textProps?: TextProps;
  lastProps?: ElementProps;
} & ElementProps;

export type _c389e38219Props = BaseTableCellProps;

export const TableCell: (
  props: BaseTableCellProps
) => React.ReactElement<BaseTableCellProps>;

export type BaseTableRowProps = {
  variant?: string;
  content?: any;
  headerProps?: ElementProps;
  altProps?: ElementProps;
} & ElementProps;

export type _c389e38216Props = BaseTableRowProps;

export const TableRow: (
  props: BaseTableRowProps
) => React.ReactElement<BaseTableRowProps>;

export type BaseTableProps = {
  variant?: string;
  content?: any;
  headerProps?: _c389e38216Props;
  noHeaderProps?: ElementProps;
} & ElementProps;

export type _c389e3829Props = BaseTableProps;

export const Table: (
  props: BaseTableProps
) => React.ReactElement<BaseTableProps>;
