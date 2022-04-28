import * as React from "react";
import { Dispatch } from "redux";
import { BaseStyleSwitcherProps } from "./view.pc";
import { DropdownMenuOption } from "../../../../../inputs/dropdown/controller";
import {
  styleVariantDropdownChanged,
  newStyleVariantButtonClicked,
  editVariantNameButtonClicked,
  removeVariantButtonClicked
} from "../../../../../../actions";
import {
  PCComponent,
  SyntheticDocument,
  SyntheticVisibleNode,
  PCVariant,
  DependencyGraph,
  getPCVariants,
  getSyntheticSourceNode,
  getSyntheticContentNode,
  isComponent,
  InspectorNode,
  getInspectorContentNode,
  getPCNode
} from "paperclip";

export type Props = {
  dispatch: Dispatch<any>;
  rootInspectorNode: InspectorNode;
  selectedInspectorNodes: InspectorNode[];
  selectedVariant: PCVariant;
  graph: DependencyGraph;
};

export default (Base: React.ComponentClass<BaseStyleSwitcherProps>) =>
  class StyleSwitcherController extends React.PureComponent<Props> {
    onAddVariantButtonClick = () => {
      this.props.dispatch(newStyleVariantButtonClicked());
    };
    onRemoveVariantButtonClick = () => {
      this.props.dispatch(removeVariantButtonClicked());
    };
    onEditNameButtonClick = () => {
      this.props.dispatch(editVariantNameButtonClicked());
    };
    onStyleChange = value => {
      const contentNode = getInspectorContentNode(
        this.props.selectedInspectorNodes[0],
        this.props.rootInspectorNode
      );
      const component = getPCNode(
        contentNode.sourceNodeId,
        this.props.graph
      ) as PCComponent;

      this.props.dispatch(styleVariantDropdownChanged(value, component));
    };
    render() {
      const {
        onRemoveVariantButtonClick,
        onAddVariantButtonClick,
        onEditNameButtonClick,
        onStyleChange
      } = this;
      const {
        selectedInspectorNodes,
        rootInspectorNode,
        graph,
        selectedVariant
      } = this.props;

      if (!selectedInspectorNodes) {
        return null;
      }

      const contentNode = getInspectorContentNode(
        selectedInspectorNodes[0],
        rootInspectorNode
      );
      const contentSourceNode = getPCNode(contentNode.sourceNodeId, graph);
      if (!contentSourceNode || !isComponent(contentSourceNode)) {
        return null;
      }

      const variants = getPCVariants(contentSourceNode);
      const options: DropdownMenuOption[] = [
        { value: undefined, label: "--" },
        ...variants.map(variant => {
          return {
            value: variant,
            label: variant.label || "Undefined"
          };
        })
      ];

      return (
        <Base
          addStyleButtonProps={{ onClick: onAddVariantButtonClick }}
          removeStyleButtonProps={{
            style: {
              display: selectedVariant ? "block" : "none"
            },
            onClick: onRemoveVariantButtonClick
          }}
          editNameButtonProps={{
            style: {
              display: selectedVariant ? "block" : "none"
            },
            onClick: onEditNameButtonClick
          }}
          dropdownProps={{
            value: variants.find(
              variant => variant.id === (selectedVariant && selectedVariant.id)
            ),
            options,
            onChange: onStyleChange
          }}
        />
      );
    }
  };
