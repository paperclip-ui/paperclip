var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import cx from "classnames";
import { TreeMoveOffset, containsNestedTreeNodeById, getParentTreeNode } from "tandem-common";
import { DropTarget } from "react-dnd";
import { InspectorTreeNodeName, inspectorNodeInShadow } from "paperclip";
import { getPCNode, PCSourceTagNames, extendsComponent, getPCNodeModule } from "paperclip";
import { compose } from "redux";
import { sourceInspectorLayerDropped } from "../../../../../actions";
import { withLayersPaneContext } from "./contexts";
import { shouldUpdate } from "recompose";
import { getSyntheticNodeInspectorNode, getInspectorContentNodeContainingChild } from "paperclip";
export const withDndContext = withLayersPaneContext(({ inspectorNode }, { dispatch, graph, rootInspectorNode }) => {
    getInspectorContentNodeContainingChild;
    getSyntheticNodeInspectorNode;
    return {
        dispatch,
        graph,
        contentNode: getInspectorContentNodeContainingChild(inspectorNode, rootInspectorNode)
    };
});
export const withNodeDropTarget = (offset) => compose(DropTarget("INSPECTOR_NODE", {
    canDrop: ({ inspectorNode, contentNode, graph }, monitor) => {
        const contentSourceNode = contentNode && getPCNode(contentNode.sourceNodeId, graph);
        const draggingInspectorNode = monitor.getItem();
        if (inspectorNode.id === draggingInspectorNode.id) {
            return false;
        }
        const draggedSourceNode = getPCNode(draggingInspectorNode.sourceNodeId, graph);
        const assocSourceNodeId = inspectorNode.name === InspectorTreeNodeName.CONTENT
            ? inspectorNode.sourceSlotNodeId
            : inspectorNode.sourceNodeId;
        const sourceNode = getPCNode(assocSourceNodeId, graph);
        const parentSourceNode = getParentTreeNode(sourceNode.id, getPCNodeModule(assocSourceNodeId, graph));
        // if the dragged node is a component, then ensure that it can only be dragged around
        // the root level of the module.
        if (draggedSourceNode.name === PCSourceTagNames.COMPONENT) {
            if (offset === TreeMoveOffset.APPEND ||
                offset === TreeMoveOffset.PREPEND) {
                return sourceNode.name === PCSourceTagNames.MODULE;
            }
            else {
                return (parentSourceNode &&
                    parentSourceNode.name === PCSourceTagNames.MODULE);
            }
        }
        if (offset === TreeMoveOffset.BEFORE ||
            offset === TreeMoveOffset.AFTER) {
            return (parentSourceNode &&
                parentSourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE &&
                !extendsComponent(parentSourceNode));
        }
        if (offset === TreeMoveOffset.APPEND ||
            offset === TreeMoveOffset.PREPEND) {
            // do not allow style mixins to have children for now. This may change
            // later on if ::part functionality is added.
            if (sourceNode.name === PCSourceTagNames.STYLE_MIXIN) {
                return false;
            }
            if (sourceNode.name === PCSourceTagNames.TEXT ||
                sourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE ||
                extendsComponent(sourceNode)) {
                return false;
            }
            return (!contentSourceNode ||
                containsNestedTreeNodeById(sourceNode.id, contentSourceNode) ||
                (inspectorNode.name === InspectorTreeNodeName.CONTENT &&
                    !inspectorNodeInShadow(inspectorNode, contentNode)));
        }
        else {
            return true;
        }
    },
    drop: ({ dispatch, inspectorNode }, monitor) => {
        dispatch(sourceInspectorLayerDropped(monitor.getItem(), inspectorNode, offset));
    }
}, (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop()
    };
}));
export const withHoverVariant = compose(shouldUpdate((props, next) => {
    return (props.isOver !== next.isOver ||
        props.connectDropTarget !== next.connectDropTarget);
}), (Base) => (_a) => {
    var { isOver, canDrop, contentNode, connectDropTarget } = _a, rest = __rest(_a, ["isOver", "canDrop", "contentNode", "connectDropTarget"]);
    return connectDropTarget(React.createElement("div", null,
        React.createElement(Base, Object.assign({}, rest, { variant: cx({
                hover: canDrop && isOver
            }) }))));
});
//# sourceMappingURL=dnd-controller.js.map