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
import { Breadcrumb } from "./view.pc";
import { breadCrumbClicked } from "../../../../../actions";
import { getPCNode, getInspectorSourceNode, PCSourceTagNames, InspectorTreeNodeName } from "paperclip";
import { getTreeNodeAncestors, EMPTY_ARRAY } from "tandem-common";
class EnhancedBreadcrumb extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onClick = () => {
            this.props.dispatch(breadCrumbClicked(this.props.inspectorNode));
        };
    }
    render() {
        const { onClick } = this;
        const { inspectorNode, selected, sourceNode, graph } = this.props;
        let sourceNodeName;
        let label;
        if (sourceNode) {
            sourceNodeName = sourceNode.name;
            if (sourceNode.name === PCSourceTagNames.PLUG) {
                label = getPCNode(sourceNode.slotId, graph).label;
            }
            else {
                label = sourceNode.label;
            }
        }
        else if (inspectorNode.name === InspectorTreeNodeName.CONTENT) {
            sourceNodeName = PCSourceTagNames.PLUG;
            label = getPCNode(inspectorNode.sourceSlotNodeId, graph)
                .label;
        }
        else {
            return null;
        }
        return (React.createElement(Breadcrumb, { onClick: onClick, variant: cx({
                component: sourceNodeName === PCSourceTagNames.COMPONENT &&
                    inspectorNode.name !== InspectorTreeNodeName.SHADOW,
                slot: sourceNodeName === PCSourceTagNames.SLOT,
                plug: sourceNodeName === PCSourceTagNames.PLUG,
                text: sourceNodeName === PCSourceTagNames.TEXT,
                selected,
                element: sourceNodeName === PCSourceTagNames.ELEMENT,
                shadow: inspectorNode.name === InspectorTreeNodeName.SHADOW
            }), labelProps: { text: label } }));
    }
}
export default (Base) => class BreadcrumbsController extends React.PureComponent {
    render() {
        const _a = this.props, { selectedInspectorNode, rootInspectorNode, dispatch, graph } = _a, rest = __rest(_a, ["selectedInspectorNode", "rootInspectorNode", "dispatch", "graph"]);
        const items = selectedInspectorNode
            ? [selectedInspectorNode]
                .concat(getTreeNodeAncestors(selectedInspectorNode.id, rootInspectorNode) || EMPTY_ARRAY)
                .reverse()
                .map(inspectorNode => {
                const sourceNode = getInspectorSourceNode(inspectorNode, rootInspectorNode, graph);
                return (React.createElement(EnhancedBreadcrumb, { graph: graph, dispatch: dispatch, key: inspectorNode.id, selected: inspectorNode.id === selectedInspectorNode.id, inspectorNode: inspectorNode, sourceNode: sourceNode }));
            })
            : EMPTY_ARRAY;
        return React.createElement(Base, Object.assign({}, rest, { items: items }));
    }
};
//# sourceMappingURL=breadcrumbs-controller.js.map