import * as React from "react";
import WelcomeController0, {
  Props as WelcomeController0Props,
} from "./controller";
import { _9f364d2139415Props } from "../../inputs/button/view.pc";
import { _ac29cd45169Props } from "../../../starter-kits/react/form.pc";
import { _a6fd80837Props } from "../../../icons/view.pc";
import { _97a34b151010442Props } from "../../dev/comments.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseWelcomeProps = {
  variant?: string;
  options?: any;
  newProjectOptions?: any;
  startProps?: ElementProps;
  tutorialsButtonProps?: _9f364d2139415Props;
  openProjectButtonProps?: _9f364d2139415Props;
  createProjectButtonProps?: _9f364d2139415Props;
  createProjectProps?: ElementProps;
  textProps?: TextProps;
  elementProps?: ElementProps;
  createReactProjectButtonProps?: _692f56f3277Props;
  createBlankProjectButtonProps?: _692f56f3277Props;
  elementProps1?: ElementProps;
  projectDescriptionProps?: TextProps;
  startProps1?: ElementProps;
  createProjectProps1?: ElementProps;
  newProjectOptionsProps?: ElementProps;
  newProjectOptionsProps1?: ElementProps;
  reactStartKitOptionsFormProps?: _ac29cd45169Props;
} & ElementProps;

export type _2b5298ab6Props = WelcomeController0Props;
export const Welcome: (
  props: WelcomeController0Props
) => React.ReactElement<WelcomeController0Props>;

export type BaseProjectPillProps = {
  icon?: any;
  iconOuterProps?: ElementProps;
  iconProps?: ElementProps;
  fileIconProps?: _a6fd80837Props;
  labelProps?: TextProps;
} & ElementProps;

export type _692f56f3277Props = BaseProjectPillProps;

export const ProjectPill: (
  props: BaseProjectPillProps
) => React.ReactElement<BaseProjectPillProps>;
