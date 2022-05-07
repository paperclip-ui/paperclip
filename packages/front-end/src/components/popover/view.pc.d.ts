import * as React from "react";
import PopoverController0, {
  Props as PopoverController0Props
} from "./controller";
import ContentController0, {
  Props as ContentController0Props
} from "./content-controller";
import { _97a34b151010442Props } from "../dev/comments.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BasePopoverProps = {
  variant?: string;
  anchor?: any;
  content?: any;
  anchorProps?: ElementProps;
  textProps?: TextProps;
  contentProps: _ddec6a12139577Props;
  elementProps?: ElementProps;
  openProps?: ElementProps;
} & ElementProps;

export type _9b7b527f175442Props = PopoverController0Props;
export const Popover: (
  props: PopoverController0Props
) => React.ReactElement<PopoverController0Props>;

export type BaseContentProps = {
  children?: any;
  elementProps?: ElementProps;
} & ElementProps;

export type _ddec6a12139577Props = ContentController0Props;
export const Content: (
  props: ContentController0Props
) => React.ReactElement<ContentController0Props>;
