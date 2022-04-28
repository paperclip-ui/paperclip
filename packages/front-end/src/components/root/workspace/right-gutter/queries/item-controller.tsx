import * as React from "react";
import { Dispatch } from "redux";
import { PCMediaQuery } from "paperclip";
// import { BaseMediaQueryItemProps } from "./view.pc";
import { queryConditionChanged } from "../../../../../actions";
export type Props = {
  mediaQuery: PCMediaQuery;
  dispatch: Dispatch<any>;
};
export default (Base: React.ComponentClass<any>) =>
  class MediaQueryItemController extends React.PureComponent<Props> {
    onLabelWidthChange = (value: string) => {
      this.props.dispatch(
        queryConditionChanged(this.props.mediaQuery, { label: value })
      );
    };
    onMinWidthChange = (value: string) => {
      this.props.dispatch(
        queryConditionChanged(this.props.mediaQuery, {
          // minWidth: value
        })
      );
    };
    onMaxWidthChange = (value: string) => {
      this.props.dispatch(
        queryConditionChanged(this.props.mediaQuery, {
          // maxWidth: value
        })
      );
    };
    render() {
      const { onLabelWidthChange, onMinWidthChange, onMaxWidthChange } = this;
      const { mediaQuery, ...rest } = this.props;
      return (
        <Base
          {...rest}
          nameInputProps={{
            value: mediaQuery.label,
            onChangeComplete: onLabelWidthChange,
            focus: mediaQuery.label == null
          }}
          minWidthInputProps={{
            // value: mediaQuery.minWidth,
            onChangeComplete: onMinWidthChange
          }}
          maxWidthInputProps={{
            // value: mediaQuery.maxWidth,
            onChangeComplete: onMaxWidthChange
          }}
        />
      );
    }
  };
