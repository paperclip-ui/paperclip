import * as React from "react";
import { attributeChanged } from "../../../../../actions";
import {
  SyntheticElement,
  PCComponent,
  PCElement,
  PCComponentInstanceElement,
  getNativeComponentName,
  DependencyGraph,
} from "paperclip";
import { Dispatch } from "redux";
import { BaseInputPropertiesProps } from "./input.pc";
import { dropdownMenuOptionFromValue } from "../../../../inputs/dropdown/controller";

export type Props = {
  baseName: string;
  dispatch: Dispatch<any>;
  sourceNode: PCComponent | PCElement | PCComponentInstanceElement;
  graph: DependencyGraph;
};

const INPUT_TYPE_OPTIONS = [
  "color",
  "date",
  "file",
  "datetime-local",
  "email",
  "month",
  "number",
  "range",
  "search",
  "tel",
  "time",
  "url",
  "week",
  "checkbox",
]
  .map(dropdownMenuOptionFromValue)
  .sort((a, b) => {
    return a < b ? -1 : 1;
  });

export default (Base: React.ComponentClass<BaseInputPropertiesProps>) =>
  class InputController extends React.PureComponent<Props> {
    onPlaceholderChange = (value) => {
      this.props.dispatch(attributeChanged("placeholder", value));
    };
    onInputTypeChange = (value) => {
      this.props.dispatch(attributeChanged("type", value));
    };
    render() {
      const { baseName, sourceNode, graph } = this.props;
      if (baseName !== "input") {
        return null;
      }
      const { onPlaceholderChange, onInputTypeChange } = this;
      return (
        <Base
          placeholderInputProps={{
            value: sourceNode.attributes.placeholder,
            onChange: onPlaceholderChange,
          }}
          inputTypeInputProps={{
            options: INPUT_TYPE_OPTIONS,
            onChangeComplete: onInputTypeChange,
            value: sourceNode.attributes.type,
          }}
        />
      );
    }
  };
