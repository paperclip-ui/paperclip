import * as React from "react";
import { Dispatch } from "redux";
import { PCQuery, PCQueryType, PCVariable } from "paperclip";
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
      const items = globalQueries.map(query => {
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
          elementProps1={null}
          elementProps2={null}
          elementProps3={null}
          elementProps4={null}
          elementProps5={null}
          addQueryDropdownProps={{
            options: QUERY_DROPDOWN_OPTIONS,
            onChangeComplete: onAddQueryDropdownSelect
          }}
          items={items}
        />
      );
    }
  };
