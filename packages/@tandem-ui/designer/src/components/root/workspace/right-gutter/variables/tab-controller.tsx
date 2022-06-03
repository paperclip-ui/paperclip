import * as React from "react";
import cx from "classnames";
import { BaseVariablesTabProps } from "./view.pc";
import { Dispatch } from "redux";
import { PCVariable } from "@paperclip-lang/core";
import { FontFamily } from "../../../../../state";

export type Props = {
  show?: boolean;
  dispatch: Dispatch<any>;
  globalFileUri: string;
  globalVariables: PCVariable[];
  fontFamilies: FontFamily[];
};

export default (Base: React.ComponentClass<BaseVariablesTabProps>) =>
  class VariablesTabController extends React.PureComponent<Props> {
    render() {
      const {
        dispatch,
        show,
        globalFileUri,
        globalVariables,
        fontFamilies,
        ...rest
      } = this.props;
      if (show === false) {
        return null;
      }
      return (
        <Base
          {...rest}
          variant={cx({
            noGlobalFile: !globalFileUri,
          })}
          variablesInputProps={{
            dispatch,
            fontFamilies,
            globalVariables,
          }}
        />
      );
    }
  };
