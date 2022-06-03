import * as React from "react";
import { Dispatch } from "redux";
import { BaseStyleBehaviorTabProps } from "./view.pc";
import { PCVariantTrigger, PCVariant, PCQuery } from "@paperclip-lang/core";

export type Props = {
  dispatch: Dispatch<any>;
  variantTriggers: PCVariantTrigger[];
  variants: PCVariant[];
  globalQueries: PCQuery[];
};

export default (Base: React.ComponentClass<BaseStyleBehaviorTabProps>) =>
  class StyleBehaviorController extends React.PureComponent<Props> {
    render() {
      const { globalQueries, dispatch, variantTriggers, variants, ...rest } =
        this.props;
      return (
        <Base
          {...rest}
          triggersPaneProps={{
            variantTriggers,
            globalQueries,
            variants,
            dispatch,
          }}
        />
      );
    }
  };
