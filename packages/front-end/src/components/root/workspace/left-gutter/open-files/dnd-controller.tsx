import * as React from "react";
import cx from "classnames";
import {
  TreeMoveOffset,
  containsNestedTreeNodeById,
  getNestedTreeNodeById,
  getParentTreeNode
} from "tandem-common";
import { DropTarget } from "react-dnd";
import {
  InspectorNode,
  InspectorTreeNodeName,
  inspectorNodeInShadow,
  getPCNodeContentNode
} from "paperclip";
import {
  getPCNode,
  PCSourceTagNames,
  PCNode,
  extendsComponent,
  DependencyGraph,
  getPCNodeModule
} from "paperclip";
import { compose, Dispatch } from "redux";
import { sourceInspectorLayerDropped } from "../../../../../actions";
import { withLayersPaneContext, LayersPaneContextProps } from "./contexts";
import { shouldUpdate } from "recompose";
import {
  getSyntheticNodeInspectorNode,
  getInspectorContentNodeContainingChild
} from "paperclip";

export type WithNodeDropTargetProps = {
  inspectorNode: InspectorNode;
};

type WithNodeDropTargetInnerProps = {
  draggedSourceNode: PCNode;
  dispatch: Dispatch;
  graph: DependencyGraph;
  contentNode: InspectorNode;
} & WithNodeDropTargetProps;

export const withDndContext = withLayersPaneContext(
  (
    { inspectorNode }: WithNodeDropTargetProps,
    { dispatch, graph, rootInspectorNode }: LayersPaneContextProps
  ) => {
    getInspectorContentNodeContainingChild;
    getSyntheticNodeInspectorNode;
    return {
      dispatch,
      graph,
      contentNode: getInspectorContentNodeContainingChild(
        inspectorNode,
        rootInspectorNode
      )
    };
  }
);

export const withNodeDropTarget = (offset: TreeMoveOffset) =>
  compose(
    DropTarget(
      "INSPECTOR_NODE",
      {
        canDrop: (
          { inspectorNode, contentNode, graph }: WithNodeDropTargetInnerProps,
          monitor
        ) => {
          const contentSourceNode =
            contentNode && getPCNode(contentNode.sourceNodeId, graph);
          const draggingInspectorNode = monitor.getItem() as InspectorNode;

          if (inspectorNode.id === draggingInspectorNode.id) {
            return false;
          }

          const draggedSourceNode = getPCNode(
            draggingInspectorNode.sourceNodeId,
            graph
          );

          const assocSourceNodeId =
            inspectorNode.name === InspectorTreeNodeName.CONTENT
              ? inspectorNode.sourceSlotNodeId
              : inspectorNode.sourceNodeId;

          const sourceNode = getPCNode(assocSourceNodeId, graph);
          const parentSourceNode: PCNode = getParentTreeNode(
            sourceNode.id,
            getPCNodeModule(assocSourceNodeId, graph)
          );

          // if the dragged node is a component, then ensure that it can only be dragged around
          // the root level of the module.
          if (draggedSourceNode.name === PCSourceTagNames.COMPONENT) {
            if (
              offset === TreeMoveOffset.APPEND ||
              offset === TreeMoveOffset.PREPEND
            ) {
              return sourceNode.name === PCSourceTagNames.MODULE;
            } else {
              return (
                parentSourceNode &&
                parentSourceNode.name === PCSourceTagNames.MODULE
              );
            }
          }

          if (
            offset === TreeMoveOffset.BEFORE ||
            offset === TreeMoveOffset.AFTER
          ) {
            return (
              parentSourceNode &&
              parentSourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE &&
                !extendsComponent(parentSourceNode)
            );
          }

          if (
            offset === TreeMoveOffset.APPEND ||
            offset === TreeMoveOffset.PREPEND
          ) {
            // do not allow style mixins to have children for now. This may change
            // later on if ::part functionality is added.
            if (sourceNode.name === PCSourceTagNames.STYLE_MIXIN) {
              return false;
            }

            if (
              sourceNode.name === PCSourceTagNames.TEXT ||
              sourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE ||
              extendsComponent(sourceNode)
            ) {
              return false;
            }

            return (
              !contentSourceNode ||
              containsNestedTreeNodeById(sourceNode.id, contentSourceNode) ||
              (inspectorNode.name === InspectorTreeNodeName.CONTENT &&
                !inspectorNodeInShadow(inspectorNode, contentNode))
            );
          } else {
            return true;
          }
        },
        drop: ({ dispatch, inspectorNode }, monitor) => {
          dispatch(
            sourceInspectorLayerDropped(
              monitor.getItem() as InspectorNode,
              inspectorNode,
              offset
            )
          );
        }
      },
      (connect, monitor) => {
        return {
          connectDropTarget: connect.dropTarget(),
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop()
        };
      }
    )
  );

export const withHoverVariant = compose(
  shouldUpdate((props: any, next: any) => {
    return (
      props.isOver !== next.isOver ||
      props.connectDropTarget !== next.connectDropTarget
    );
  }),
  (Base: React.ComponentClass<any>) => ({
    isOver,
    canDrop,
    contentNode,
    connectDropTarget,
    ...rest
  }) => {
    return connectDropTarget(
      <div>
        <Base
          {...rest}
          variant={cx({
            hover: canDrop && isOver
          })}
        />
      </div>
    );
  }
);
