import * as React from "react";
import {
  getPCVariants,
  getPCNode,
  DependencyGraph,
  isComponent,
  getVariantTriggers,
  PCVariant,
  PCComponent,
  InspectorNode,
  getInspectorContentNode
} from "paperclip";
import { Dispatch } from "redux";
import { VariantOption } from "./option.pc";
import { EMPTY_ARRAY } from "tandem-common";

export type Props = {
  dispatch: Dispatch<any>;
  rootInspectorNode: InspectorNode;
  selectedInspectorNodes: InspectorNode[];
  selectedVariant: PCVariant;
  graph: DependencyGraph;
};

export type InnerProps = {
  onAddVariantButtonClick: any;
  onRemoveVariantButtonClick: any;
} & Props;

export default (Base: React.ComponentClass<any>) =>
  class VariantsController extends React.PureComponent<Props> {
    onAddVariantButtonClick = () => {};
    onRemoveVariantButtonClick = () => {};
    render() {
      const { onRemoveVariantButtonClick, onAddVariantButtonClick } = this;
      const {
        dispatch,
        selectedInspectorNodes,
        rootInspectorNode,
        graph,
        selectedVariant
      } = this.props;

      const contentNode = getInspectorContentNode(
        selectedInspectorNodes[0],
        rootInspectorNode
      );
      const contentSourceNode = getPCNode(contentNode.sourceNodeId, graph);
      if (!contentSourceNode || !isComponent(contentSourceNode)) {
        return null;
      }

      const variantOptions = EMPTY_ARRAY;

      return (
        <Base
          removeVariantButtonProps={{
            onClick: onRemoveVariantButtonClick,
            style: {
              display: selectedVariant ? "block" : "none"
            }
          }}
          addVariantButtonProps={{
            onClick: onAddVariantButtonClick
          }}
          listProps={{
            children: variantOptions
          }}
        />
      );
    }
  };
