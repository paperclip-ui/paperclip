import * as React from "react";
import BottomGutterController0, {
  Props as BottomGutterController0Props,
} from "./controller";
import ConsoleController0, {
  Props as ConsoleController0Props,
} from "./console-controller";
import ConsoleLogsController0, {
  Props as ConsoleLogsController0Props,
} from "./console-logs-controller";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseBottomGutterProps = {
  consoleProps: _694404cc2671Props;
  elementProps?: ElementProps;
  closeButtonProps?: TextProps;
} & ElementProps;

export type _694404cc2576Props = BottomGutterController0Props;
export const BottomGutter: (
  props: BottomGutterController0Props
) => React.ReactElement<BottomGutterController0Props>;

export type BaseConsoleProps = {
  variant?: string;
  tabs?: any;
  tabBarProps?: ElementProps;
  tabProps?: _d3d61e4d34905Props;
  tabProps1?: _d3d61e4d34905Props;
  elementProps?: ElementProps;
  noProcessesLabelProps?: TextProps;
  consoleLogsProps: _983742ed977Props;
  noProcessesProps?: ElementProps;
} & ElementProps;

export type _694404cc2671Props = ConsoleController0Props;
export const Console: (
  props: ConsoleController0Props
) => React.ReactElement<ConsoleController0Props>;

export type BaseConsoleTabProps = {
  variant?: string;
  labelProps?: TextProps;
  selectedProps?: ElementProps;
} & ElementProps;

export type _d3d61e4d34905Props = BaseConsoleTabProps;

export const ConsoleTab: (
  props: BaseConsoleTabProps
) => React.ReactElement<BaseConsoleTabProps>;

export type BaseConsoleLogsProps = {
  content?: any;
  consoleLogProps?: _983742ed986Props;
  consoleLogProps1?: _983742ed986Props;
  consoleLogProps2?: _983742ed986Props;
  consoleLogProps3?: _983742ed986Props;
  consoleLogProps4?: _983742ed986Props;
  consoleLogProps5?: _983742ed986Props;
} & ElementProps;

export type _983742ed977Props = ConsoleLogsController0Props;
export const ConsoleLogs: (
  props: ConsoleLogsController0Props
) => React.ReactElement<ConsoleLogsController0Props>;

export type BaseConsoleLogProps = {
  variant?: string;
  labelProps?: TextProps;
  errorProps?: ElementProps;
} & ElementProps;

export type _983742ed986Props = BaseConsoleLogProps;

export const ConsoleLog: (
  props: BaseConsoleLogProps
) => React.ReactElement<BaseConsoleLogProps>;
