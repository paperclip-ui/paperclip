import * as React from "react";
import { compose } from "recompose";
import * as cx from "classnames";
import {
  default as checkboxController,
  Props as CheckboxProps
} from "../checkbox/controller";
import { BaseSwitchProps } from "./view.pc";

export type Props = CheckboxProps;

export default compose<BaseSwitchProps, CheckboxProps>(
  checkboxController,
  (Base: React.ComponentClass<BaseSwitchProps>) => ({
    value,
    onChange,
    onChangeComplete,
    ...rest
  }) => {
    return <Base variant={cx({ on: value })} {...rest} />;
  }
);
