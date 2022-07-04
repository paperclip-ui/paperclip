import * as React from "react";
import { Dispatch } from "redux";
import { PCQuery, PCQueryType, PCVariable } from "@paperclip-lang/core";
import { BaseQueriesPaneProps, QueryItem } from "./view.pc";
import { addQueryButtonClick } from "../../../../../actions";
import { QUERY_DROPDOWN_OPTIONS } from "./utils";
export type Props = {
  dispatch: Dispatch<any>;
  globalQueries: PCQuery[];
  globalVariables: PCVariable[];
};

export default (Base: React.ComponentClass<BaseQueriesPaneProps>) =>
  class MediaQueriesController extends React.PureComponent<Props> {
    onAddQueryDropdownSelect = (value: PCQueryType) => {
      this.props.dispatch(addQueryButtonClick(value));
    };
    render() {
      const { onAddQueryDropdownSelect } = this;
      const { globalQueries, globalVariables, dispatch, ...rest } = this.props;
      const items = globalQueries.map((query) => {
        return (
          <QueryItem
            dispatch={dispatch}
            key={query.id}
            query={query}
            globalVariables={globalVariables}
          />
        );
      });
      return (
        <Base
          {...rest}
          element1Props={null}
          element2Props={null}
          element3Props={null}
          element4Props={null}
          element5Props={null}
          addQueryDropdownProps={{
            options: QUERY_DROPDOWN_OPTIONS,
            onChangeComplete: onAddQueryDropdownSelect,
          }}
          items={items}
        />
      );
    }
  };
