import * as React from "react";
import { BaseInstancePaneProps } from "./instance.pc";
import { Dispatch } from "redux";
import cx from "classnames";
import {
  DependencyGraph,
  PCVariant,
  InspectorNode,
  PCSourceTagNames,
  extendsComponent,
  getInspectorSourceNode,
  inspectorNodeInShadow,
  getTopMostInspectorInstance,
  PCVisibleNode,
  PCOverride,
  PCComponent,
  getPCNodeContentNode,
  getPCNodeModule,
  ComputedStyleInfo,
  getInstanceVariantInfo,
} from "paperclip";
import { dropdownMenuOptionFromValue } from "../../../../../../inputs/dropdown/controller";
import {
  cssResetPropertyOptionClicked,
  instanceVariantToggled,
} from "../../../../../../../actions";
import {
  getParentTreeNode,
  containsNestedTreeNodeById,
  EMPTY_ARRAY,
} from "tandem-common";
import { VariantOption } from "../../variants/option.pc";

export type Props = {
  selectedInspectorNodes: InspectorNode[];
  rootInspectorNode: InspectorNode;
  dispatch: Dispatch<any>;
  graph: DependencyGraph;
  selectedVariant: PCVariant;
  computedStyleInfo: ComputedStyleInfo;
};

export default (Base: React.ComponentClass<BaseInstancePaneProps>) =>
  class InstancePaneController extends React.PureComponent<Props> {
    onResetStyle = (property: string) => {
      this.props.dispatch(cssResetPropertyOptionClicked(property));
    };
    onVariantToggle = (variant: PCVariant) => {
      this.props.dispatch(instanceVariantToggled(variant));
    };
    render() {
      const { onResetStyle, onVariantToggle } = this;
      const {
        selectedInspectorNodes,
        computedStyleInfo,
        rootInspectorNode,
        selectedVariant,
        dispatch,
        graph,
        ...rest
      } = this.props;
      const selectedInspectorNode = selectedInspectorNodes[0];
      if (!selectedInspectorNode) {
        return null;
      }

      const sourceNode = getInspectorSourceNode(
        selectedInspectorNode,
        rootInspectorNode,
        graph
      ) as PCVisibleNode | PCComponent | null;

      // may not exist for things like plugs
      if (!sourceNode) {
        return null;
      }

      const contentNode = getPCNodeContentNode(
        sourceNode.id,
        getPCNodeModule(sourceNode.id, graph)
      );

      if (!contentNode) {
        return null;
      }

      if (
        sourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE &&
        (sourceNode.name !== PCSourceTagNames.COMPONENT ||
          !extendsComponent(sourceNode))
      ) {
        if (!inspectorNodeInShadow(selectedInspectorNode, rootInspectorNode)) {
          // needs to show up within components particularly for variants
          if (contentNode.name !== PCSourceTagNames.COMPONENT) {
            return null;
          }
        }
      }

      const instance = getTopMostInspectorInstance(
        selectedInspectorNode,
        rootInspectorNode
      );

      const instanceSourceNode = getInspectorSourceNode(
        instance,
        rootInspectorNode,
        graph
      ) as PCVisibleNode | PCComponent;

      // if top most source node is not component or instance, then the target node is _not_ in a shadow
      const topMostSourceNode =
        instanceSourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE ||
        instanceSourceNode.name === PCSourceTagNames.COMPONENT
          ? instanceSourceNode
          : contentNode;

      const overrideKeys = [
        ...Object.keys(computedStyleInfo.style).filter((key) => {
          const overrides =
            computedStyleInfo.styleOverridesMap[key] || EMPTY_ARRAY;

          const inCurrentInstance = overrides.some((override: PCOverride) => {
            return (
              containsNestedTreeNodeById(override.id, topMostSourceNode) &&
              override.variantId == (selectedVariant && selectedVariant.id)
            );
          });

          // if variant is selected, then override must be present
          return (
            inCurrentInstance ||
            (!selectedVariant &&
              instanceSourceNode.style &&
              Boolean(instanceSourceNode.style[key]))
          );
        }),
      ];

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

      const options = variantInfo.map(({ variant, component, enabled }, i) => {
        return (
          <VariantOption
            alt={Boolean(i % 2)}
            enabled={enabled}
            key={variant.id}
            item={variant}
            switchProps={null}
            dispatch={dispatch}
            onToggle={onVariantToggle}
            graph={graph}
            component={component}
            instance={instanceSourceNode as PCComponent}
          />
        );
      });

      return (
        <Base
          {...rest}
          variantOptionProps={null}
          variantOptionProps1={null}
          variantOptionProps2={null}
          variantOptionProps3={null}
          variant={cx({
            hasOverrides: overrideKeys.length > 0,
          })}
          resetDropdownProps={{
            options: overrideKeys.map(dropdownMenuOptionFromValue),
            onChangeComplete: onResetStyle,
          }}
          content={options}
        />
      );
    }
  };
