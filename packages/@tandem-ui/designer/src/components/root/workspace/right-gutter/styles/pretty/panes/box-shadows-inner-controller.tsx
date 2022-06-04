import * as React from "react";
import { SyntheticElement, PCVariable, ComputedStyleInfo } from "paperclip";
import { Dispatch } from "redux";
import { BaseInnerShadowsProps } from "./box-shadows.pc";

export type Props = {
  documentColors: string[];
  globalVariables: PCVariable[];
  value?: string;
  dispatch: Dispatch<any>;
  computedStyleInfo: ComputedStyleInfo;
};

export default (Base: React.ComponentClass<BaseInnerShadowsProps>) =>
  (props: Props) => {
    return <Base {...props} inset />;
  };
