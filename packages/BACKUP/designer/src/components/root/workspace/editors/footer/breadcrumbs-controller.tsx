import * as React from "react";
import cx from "classnames";
import { Dispatch } from "redux";
import { BaseBreadcrumbsProps, Breadcrumb } from "./view.pc";
import { breadCrumbClicked } from "../../../../../actions";
import {
  InspectorNode,
  DependencyGraph,
  PCVisibleNode,
  getPCNode,
  getInspectorSourceNode,
  PCSourceTagNames,
  PCComponent,
  PCSlot,
  PCPlug,
  InspectorTreeNodeName,
} from "paperclip";
import { getTreeNodeAncestors, EMPTY_ARRAY } from "tandem-common";

export type Props = {
  dispatch: Dispatch<any>;
  graph: DependencyGraph;
  rootInspectorNode: InspectorNode;
  selectedInspectorNode: InspectorNode;
} & BaseBreadcrumbsProps;

type BreadcrumbProps = {
  graph: DependencyGraph;
  dispatch: Dispatch<any>;
  inspectorNode: InspectorNode;
  sourceNode: PCVisibleNode | PCComponent | PCSlot | PCPlug;
  selected: boolean;
};

class EnhancedBreadcrumb extends React.PureComponent<BreadcrumbProps> {
  onClick = () => {
    this.props.dispatch(breadCrumbClicked(this.props.inspectorNode));
  };
  render() {
    const { onClick } = this;
    const { inspectorNode, selected, sourceNode, graph } = this.props;

    let sourceNodeName: PCSourceTagNames;
    let label: string;
    if (sourceNode) {
      sourceNodeName = sourceNode.name;
      if (sourceNode.name === PCSourceTagNames.PLUG) {
        label = (getPCNode(sourceNode.slotId, graph) as PCSlot).label;
      } else {
        label = sourceNode.label;
      }
    } else if (inspectorNode.name === InspectorTreeNodeName.CONTENT) {
      sourceNodeName = PCSourceTagNames.PLUG;
      label = (getPCNode(inspectorNode.sourceSlotNodeId, graph) as PCSlot)
        .label;
    } else {
      return null;
    }
    return (
      <Breadcrumb
        onClick={onClick}
        variant={cx({
          component:
            sourceNodeName === PCSourceTagNames.COMPONENT &&
            inspectorNode.name !== InspectorTreeNodeName.SHADOW,
          slot: sourceNodeName === PCSourceTagNames.SLOT,
          plug: sourceNodeName === PCSourceTagNames.PLUG,
          text: sourceNodeName === PCSourceTagNames.TEXT,
          selected,
          element: sourceNodeName === PCSourceTagNames.ELEMENT,
          shadow: inspectorNode.name === InspectorTreeNodeName.SHADOW,
        })}
        labelProps={{ text: label }}
      />
    );
  }
}

export default (Base: React.ComponentClass<BaseBreadcrumbsProps>) =>
  class BreadcrumbsController extends React.PureComponent<Props> {
    render() {
      const {
        selectedInspectorNode,
        rootInspectorNode,
        dispatch,
        graph,
        ...rest
      } = this.props;

      const items = selectedInspectorNode
        ? [selectedInspectorNode]
            .concat(
              getTreeNodeAncestors(
                selectedInspectorNode.id,
                rootInspectorNode
              ) || EMPTY_ARRAY
            )
            .reverse()
            .map((inspectorNode) => {
              const sourceNode = getInspectorSourceNode(
                inspectorNode as InspectorNode,
                rootInspectorNode,
                graph
              );
              return (
                <EnhancedBreadcrumb
                  graph={graph}
                  dispatch={dispatch}
                  key={inspectorNode.id}
                  selected={inspectorNode.id === selectedInspectorNode.id}
                  inspectorNode={inspectorNode as InspectorNode}
                  sourceNode={sourceNode as PCVisibleNode}
                />
              );
            })
        : EMPTY_ARRAY;

      return <Base {...rest} items={items} />;
    }
  };
