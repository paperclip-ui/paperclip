import * as React from "react";
import {
  cssPropertyChangeCompleted,
  cssPropertyChanged,
} from "../../../../../../../actions";
import { memoize } from "tandem-common";
import {
  SyntheticElement,
  PCVariable,
  PCSourceTagNames,
  isTextLikePCNode,
  ComputedStyleInfo,
} from "paperclip";
import { Dispatch } from "redux";
import { BaseBorderProps } from "./borders.pc";

export type Props = {
  globalVariables: PCVariable[];
  documentColors: string[];
  dispatch: Dispatch;
  computedStyleInfo: ComputedStyleInfo;
};

export default (Base: React.ComponentClass<BaseBorderProps>) =>
  class BordersController extends React.PureComponent<Props> {
    onPropertyChange = (name, value) => {
      this.props.dispatch(cssPropertyChanged(name, value));
    };
    onPropertyChangeComplete = (name, value) => {
      this.props.dispatch(cssPropertyChangeCompleted(name, value));
    };
    render() {
      const { computedStyleInfo, documentColors, globalVariables } = this.props;
      const { onPropertyChange, onPropertyChangeComplete } = this;
      const { sourceNode } = computedStyleInfo;

      // Typography pane is only available to text nodes to prevent cascading styles

      if (isTextLikePCNode(sourceNode)) {
        return null;
      }

      if (!computedStyleInfo) {
        return null;
      }
      return (
        <Base
          borderStylingProps={{
            documentColors,
            computedStyleInfo,
            globalVariables,
            onPropertyChange,
            onPropertyChangeComplete,
          }}
          bottomLeftRadiusInputProps={{
            value: computedStyleInfo.style["border-bottom-left-radius"],
            onChange: propertyChangeCallback(
              "border-bottom-left-radius",
              onPropertyChange
            ),
            onChangeComplete: propertyChangeCallback(
              "border-bottom-left-radius",
              onPropertyChangeComplete
            ),
          }}
          bottomRightRadiusInputProps={{
            value: computedStyleInfo.style["border-bottom-right-radius"],
            onChange: propertyChangeCallback(
              "border-bottom-right-radius",
              onPropertyChange
            ),
            onChangeComplete: propertyChangeCallback(
              "border-bottom-right-radius",
              onPropertyChangeComplete
            ),
          }}
          topLeftRadiusInputProps={{
            value: computedStyleInfo.style["border-top-left-radius"],
            onChange: propertyChangeCallback(
              "border-top-left-radius",
              onPropertyChange
            ),
            onChangeComplete: propertyChangeCallback(
              "border-top-left-radius",
              onPropertyChangeComplete
            ),
          }}
          topRightRadiusInputProps={{
            value: computedStyleInfo.style["border-top-right-radius"],
            onChange: propertyChangeCallback(
              "border-top-right-radius",
              onPropertyChange
            ),
            onChangeComplete: propertyChangeCallback(
              "border-top-right-radius",
              onPropertyChangeComplete
            ),
          }}
        />
      );
    }
  };

const propertyChangeCallback = memoize(
  (name: string, listener) => (value) => listener(name, value)
);
