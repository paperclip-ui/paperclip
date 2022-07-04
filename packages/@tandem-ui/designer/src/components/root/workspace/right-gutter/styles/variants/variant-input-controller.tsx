import * as React from "react";
import {
  DependencyGraph,
  PCVariant,
  InspectorNode,
  getInstanceVariantInfo,
  PCSourceTagNames,
  extendsComponent,
  PCNode,
} from "@paperclip-lang/core";
import { Dispatch } from "redux";
import { VariantOption } from "./option.pc";
import { instanceVariantToggled } from "../../../../../../actions";
import { BaseComponentInstanceVariantProps } from "./variant-input.pc";
import { EMPTY_ARRAY } from "tandem-common";

export type Props = {
  sourceNode: PCNode;
  selectedInspectorNode: InspectorNode;
  rootInspectorNode: InspectorNode;
  dispatch: Dispatch<any>;
  graph: DependencyGraph;
  selectedVariant: PCVariant;
};

export default (
  Base: React.ComponentClass<BaseComponentInstanceVariantProps>
) =>
  class VariantInputController extends React.PureComponent<Props> {
    onVariantToggle = (variant: PCVariant) => {
      this.props.dispatch(instanceVariantToggled(variant));
    };
    render() {
      const { onVariantToggle } = this;
      const {
        selectedInspectorNode,
        rootInspectorNode,
        graph,
        sourceNode,
        selectedVariant,
        dispatch,
      } = this.props;

      if (
        sourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE &&
        (sourceNode.name !== PCSourceTagNames.COMPONENT ||
          !extendsComponent(sourceNode))
      ) {
        return null;
      }

      const variantInfo = getInstanceVariantInfo(
        selectedInspectorNode,
        rootInspectorNode,
        graph,
        selectedVariant && selectedVariant.id
      );

      if (!variantInfo.length) {
        return null;
      }

      const options = EMPTY_ARRAY;

      return <Base options={options} />;
    }
  };
