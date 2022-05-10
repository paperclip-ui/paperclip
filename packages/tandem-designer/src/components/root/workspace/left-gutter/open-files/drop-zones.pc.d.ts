import * as React from "react";
import BeforeDropZoneController0, {
  Props as BeforeDropZoneController0Props,
} from "./before-dnd-controller";
import AfterDropZoneController0, {
  Props as AfterDropZoneController0Props,
} from "./after-dnd-controller";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseBeforeDropZoneProps = {} & _6f0de1ad85Props;

export type _207a949d27Props = BeforeDropZoneController0Props;
export const BeforeDropZone: (
  props: BeforeDropZoneController0Props
) => React.ReactElement<BeforeDropZoneController0Props>;

export type BaseAfterDropZoneProps = {} & _6f0de1ad85Props;

export type _207a949d21Props = AfterDropZoneController0Props;
export const AfterDropZone: (
  props: AfterDropZoneController0Props
) => React.ReactElement<AfterDropZoneController0Props>;

export type BaseDropZoneProps = {
  variant?: string;
  hoverProps?: ElementProps;
  dotProps?: ElementProps;
} & ElementProps;

export type _6f0de1ad85Props = BaseDropZoneProps;

export const DropZone: (
  props: BaseDropZoneProps
) => React.ReactElement<BaseDropZoneProps>;
