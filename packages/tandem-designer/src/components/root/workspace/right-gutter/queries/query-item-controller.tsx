import * as React from "react";
import cx from "classnames";
import { Dispatch } from "redux";
import { PCQuery, PCQueryType, PCVariable } from "paperclip";
import { BaseQueryItemProps, QueryOptions } from "./view.pc";
import { queryLabelChanged } from "../../../../../actions";

export type Props = {
  query: PCQuery;
  dispatch: Dispatch<any>;
  globalVariables: PCVariable[];
};

export default (Base: React.ComponentClass<BaseQueryItemProps>) =>
  class BaseQueryItemController extends React.PureComponent<Props> {
    onLabelChange = (value: string) => {
      this.props.dispatch(queryLabelChanged(this.props.query, value));
    };
    render() {
      const { onLabelChange } = this;
      const { query, dispatch, globalVariables, ...rest } = this.props;
      return (
        <Base
          {...rest}
          queryOptionsProps={null}
          editButtonProps={{
            right: true,
            content: (
              <QueryOptions
                dispatch={dispatch}
                query={query}
                globalVariables={globalVariables}
              />
            ),
          }}
          labelInputProps={{
            value: query.label,
            focus: !query.label,
            onChangeComplete: onLabelChange,
          }}
        />
      );
    }
  };
