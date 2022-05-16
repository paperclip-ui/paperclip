import * as React from "react";
import { Dispatch } from "redux";
import { BaseSpacingPaneProps } from "./spacing.pc";
import { Side } from "./spacing-input-controller";
import { ComputedStyleInfo } from "paperclip";
import { memoize } from "tandem-common";
import {
  cssPropertyChanged,
  cssPropertyChangeCompleted,
} from "../../../../../../../actions";
import {
  DropdownMenuOption,
  dropdownMenuOptionFromValue,
} from "../../../../../../inputs/dropdown/controller";
export type Props = {
  dispatch: Dispatch<any>;
  computedStyleInfo: ComputedStyleInfo;
};

const BOX_SIZING_OPTIONS: DropdownMenuOption[] = [
  undefined,
  "border-box",
  "content-box",
].map(dropdownMenuOptionFromValue);

export default (Base: React.ComponentClass<BaseSpacingPaneProps>) =>
  class SpacingPaneController extends React.PureComponent<Props> {
    render() {
      const { dispatch, computedStyleInfo, ...rest } = this.props;
      return (
        <Base
          {...rest}
          boxSizingInputProps={{
            options: BOX_SIZING_OPTIONS,
            value: computedStyleInfo.style["box-sizing"],
            onChangeComplete: propertyChangeCompleteCallback(
              dispatch,
              "box-sizing"
            ),
          }}
          marginInputProps={{
            left: computedStyleInfo.style["margin-left"],
            top: computedStyleInfo.style["margin-top"],
            right: computedStyleInfo.style["margin-right"],
            bottom: computedStyleInfo.style["margin-bottom"],
            onSideChange: sideChangeCallback(dispatch, "margin"),
            onSideChangeComplete: sideChangeCompleteCallback(
              dispatch,
              "margin"
            ),
            selectedId: computedStyleInfo.sourceNode.id,
          }}
          paddingInputProps={{
            left: computedStyleInfo.style["padding-left"],
            top: computedStyleInfo.style["padding-top"],
            right: computedStyleInfo.style["padding-right"],
            bottom: computedStyleInfo.style["padding-bottom"],
            onSideChange: sideChangeCallback(dispatch, "padding"),
            selectedId: computedStyleInfo.sourceNode.id,
            onSideChangeComplete: sideChangeCompleteCallback(
              dispatch,
              "padding"
            ),
          }}
        />
      );
    }
  };

const sideChangeCallback = memoize(
  (dispatch: Dispatch<any>, type: string) => (side: Side, value: string) => {
    dispatch(cssPropertyChanged(`${type}-${side}`, value));
  }
);

const propertyChangeCompleteCallback = memoize(
  (dispatch, name: string) => (value) => {
    dispatch(cssPropertyChangeCompleted(name, value));
  }
);

const sideChangeCompleteCallback = memoize(
  (dispatch: Dispatch<any>, type: string) => (side: Side, value: string) => {
    dispatch(cssPropertyChangeCompleted(`${type}-${side}`, value));
  }
);
