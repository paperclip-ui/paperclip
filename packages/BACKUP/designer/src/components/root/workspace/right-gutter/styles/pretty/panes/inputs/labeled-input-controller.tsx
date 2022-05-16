import * as React from "react";
import cx from "classnames";
import { InspectorNode } from "paperclip";
import { BaseLabeledCssInputProps } from "./view.pc";
import { Dispatch } from "redux";
import { cssInheritedFromLabelClicked } from "../../../../../../../../actions";

export type Props = {
  inheritedFromNode?: InspectorNode;
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseLabeledCssInputProps>) =>
  class LabeledCSSInputController extends React.PureComponent<Props> {
    onLabelClick = () => {
      if (this.props.inheritedFromNode) {
        this.props.dispatch(
          cssInheritedFromLabelClicked(this.props.inheritedFromNode)
        );
      }
    };
    render() {
      const { onLabelClick } = this;
      const { inheritedFromNode, ...rest } = this.props;
      return (
        <Base
          {...rest}
          textInputProps={null}
          projectNameInputProps={null}
          variant={cx({
            inherited: Boolean(inheritedFromNode),
          })}
          labelProps={{
            onClick: onLabelClick,
          }}
        />
      );
    }
  };
