import * as React from "react";
import { BaseAPropertiesProps } from "./view.pc";
import { Dispatch } from "redux";
import {
  PCNode,
  PCElement,
  PCComponent,
  PCComponentInstanceElement,
} from "@paperclip-lang/core";
import { attributeChanged } from "../../../../../actions";

export type Props = {
  baseName: string;
  dispatch: Dispatch<any>;
  sourceNode: PCElement | PCComponent | PCComponentInstanceElement;
};

export default (Base: React.ComponentClass<BaseAPropertiesProps>) =>
  class APropertiesController extends React.PureComponent<Props> {
    onHrefChangeComplete = (value) => {
      this.props.dispatch(attributeChanged("href", value));
    };
    render() {
      const { baseName, sourceNode, ...rest } = this.props;
      const { onHrefChangeComplete } = this;
      if (baseName !== "a") {
        return null;
      }

      return (
        <Base
          {...rest}
          hrefInputProps={{
            value: sourceNode.attributes.href,
            onChange: onHrefChangeComplete,
          }}
        />
      );
    }
  };
