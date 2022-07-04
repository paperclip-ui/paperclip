import * as React from "react";
import {
  PCSourceTagNames,
  SyntheticVisibleNode,
  SyntheticTextNode,
} from "@paperclip-lang/core";
import { textValueChanged } from "../../../../../actions";
import { BaseTextPropertiesProps, ElementProps } from "./view.pc";
import { Dispatch } from "redux";

export type Props = {
  dispatch: Dispatch<any>;
  selectedNodes: SyntheticVisibleNode[];
} & ElementProps;

type InnerProps = {
  onTextValueChange: any;
} & Props;

export default (Base: React.ComponentClass<BaseTextPropertiesProps>) =>
  class TextController extends React.PureComponent<Props> {
    onTextValueChange = (value) => {
      this.props.dispatch(textValueChanged(value));
    };

    render() {
      const { selectedNodes, ...rest } = this.props;
      const { onTextValueChange } = this;

      const textNode = selectedNodes.find(
        (node: SyntheticVisibleNode) => node.name == PCSourceTagNames.TEXT
      ) as SyntheticTextNode;

      if (!textNode) {
        return null;
      }
      return (
        <Base
          {...rest}
          textInputProps={{
            value: textNode.value,
            onChange: onTextValueChange,
          }}
        />
      );
    }
  };
