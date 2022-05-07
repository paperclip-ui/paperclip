import * as React from "react";
import cx from "classnames";
import { Dispatch } from "redux";
import { PCVariable, PCQuery } from "paperclip";
import { FontFamily } from "../../../../state";
import { BaseGlobalPropertiesProps } from "./view.pc";

export type Props = {
  show?: boolean;
  dispatch: Dispatch<any>;
  globalFileUri: string;
  globalVariables: PCVariable[];
  fontFamilies: FontFamily[];
  globalQueries: PCQuery[];
};

export default (Base: React.ComponentClass<BaseGlobalPropertiesProps>) =>
  class GlobalPropertiesController extends React.PureComponent<Props> {
    render() {
      const {
        dispatch,
        globalFileUri,
        globalQueries,
        globalVariables,
        fontFamilies,
        ...rest
      } = this.props;
      return (
        <Base
          {...rest}
          variablesSectionProps={{
            show: true,
            dispatch,
            globalFileUri,
            globalVariables,
            fontFamilies
          }}
          queriesPaneProps={{
            dispatch,
            globalVariables,
            globalQueries
          }}
        />
      );
    }
  };
