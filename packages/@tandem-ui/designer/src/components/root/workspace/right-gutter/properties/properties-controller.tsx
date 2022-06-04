import * as React from "react";
import cx from "classnames";
import {
  PCSourceTagNames,
  getPCNode,
  DependencyGraph,
  SyntheticElement,
  PCVisibleNode,
  isPCContentNode,
  isElementLikePCNode,
  isTextLikePCNode,
} from "paperclip";
import { BasePropertiesProps, ElementProps } from "./view.pc";
import { InspectorNode } from "paperclip";
import { Dispatch } from "redux";

export type PropertiesControllerOuterProps = {};

export type Props = {
  visible: boolean;
  selectedNodes: SyntheticElement[];
  selectedInspectorNodes: InspectorNode[];
  graph: DependencyGraph;
  className?: string;
  dispatch: Dispatch<any>;
  sourceNodeUri: string;
  rootInspectorNode: InspectorNode;
} & ElementProps;

export default (Base: React.ComponentClass<BasePropertiesProps>) =>
  class PropertiesController extends React.PureComponent<Props> {
    render() {
      const {
        visible,
        className,
        selectedInspectorNodes,
        rootInspectorNode,
        selectedNodes,
        graph,
        dispatch,
        sourceNodeUri,
        ...rest
      } = this.props;
      if (!selectedInspectorNodes.length || !visible) {
        return null;
      }

      const selectedNode = selectedInspectorNodes[0];

      const sourceNode = getPCNode(selectedNode.sourceNodeId, graph);

      return (
        <Base
          className={className}
          {...rest}
          variant={cx({
            slot: sourceNode.name === PCSourceTagNames.SLOT,
            component: sourceNode.name === PCSourceTagNames.COMPONENT,
            text: isTextLikePCNode(sourceNode),
            element: isElementLikePCNode(sourceNode),
            contentNode: isPCContentNode(sourceNode, graph),
          })}
          framePaneProps={{
            dispatch,
            selectedNode: sourceNode as PCVisibleNode,
            graph,
          }}
          controllersPaneProps={{
            selectedNodes,
            graph,
            dispatch,
            sourceNodeUri,
          }}
          textProps={{
            dispatch,
            selectedNodes,
          }}
          elementProps={{
            sourceNode: sourceNode as PCVisibleNode,
            graph,
            dispatch,
          }}
        />
      );
    }
  };
