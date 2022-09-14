import * as React from "react";
import { Dispatch } from "redux";
import { BaseMediaQueryOptionsProps } from "./view.pc";
import { queryConditionChanged } from "../../../../../actions";
import { PCQuery, PCMediaQuery } from "@paperclip-lang/core";
import { EMPTY_OBJECT } from "tandem-common";
export type Props = {
  query: PCMediaQuery;
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseMediaQueryOptionsProps>) =>
  class MediaQueryOptionsController extends React.PureComponent<Props> {
    onMinWidthChange = (minWidth: string) => {
      this.props.dispatch(
        queryConditionChanged(this.props.query, {
          ...(this.props.query.condition || EMPTY_OBJECT),
          maxWidth: minWidth && Number(minWidth),
        })
      );
    };
    onMaxWidthChange = (maxWidth: string) => {
      this.props.dispatch(
        queryConditionChanged(this.props.query, {
          ...(this.props.query.condition || EMPTY_OBJECT),
          maxWidth: maxWidth && Number(maxWidth),
        })
      );
    };
    render() {
      const { onMinWidthChange, onMaxWidthChange } = this;
      const { query, ...rest } = this.props;
      return (
        <Base
          {...rest}
          minWidthInputProps={{
            value: query.condition && query.condition.minWidth,
            onChangeComplete: onMinWidthChange,
          }}
          maxWidthInputProps={{
            value: query.condition && query.condition.maxWidth,
            onChangeComplete: onMaxWidthChange,
          }}
        />
      );
    }
  };
