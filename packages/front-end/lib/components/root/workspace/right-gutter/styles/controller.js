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
import { getPCNode, PCSourceTagNames, computeStyleInfo, getComponentVariantTriggers, getInspectorContentNode, isComponent, getComponentVariants } from "paperclip";
import { EMPTY_ARRAY } from "tandem-common";
var Tab;
(function (Tab) {
    Tab[Tab["PROPERTIES"] = 0] = "PROPERTIES";
    Tab[Tab["TRIGGERS"] = 1] = "TRIGGERS";
})(Tab || (Tab = {}));
export default (Base) => class RightGutterController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            tab: Tab.PROPERTIES
        };
        this.onTriggersTabClick = () => {
            this.setState({
                tab: Tab.TRIGGERS
            });
        };
        this.onPropertiesTabClick = () => {
            this.setState({
                tab: Tab.PROPERTIES
            });
        };
    }
    render() {
        const _a = this.props, { cwd, visible, globalVariables, dispatch, selectedVariant, fontFamilies, graph, projectOptions, globalQueries, selectedInspectorNodes, rootInspectorNode, documentColors } = _a, rest = __rest(_a, ["cwd", "visible", "globalVariables", "dispatch", "selectedVariant", "fontFamilies", "graph", "projectOptions", "globalQueries", "selectedInspectorNodes", "rootInspectorNode", "documentColors"]);
        const { onTriggersTabClick, onPropertiesTabClick } = this;
        const { tab } = this.state;
        if (!selectedInspectorNodes.length || !visible) {
            return null;
        }
        const sourceNode = getPCNode(selectedInspectorNodes[0].sourceNodeId, graph);
        if (!sourceNode || sourceNode.name === PCSourceTagNames.MODULE) {
            return null;
        }
        const computedStyleInfo = computeStyleInfo(selectedInspectorNodes[0], rootInspectorNode, selectedVariant, graph);
        const contentNode = getInspectorContentNode(selectedInspectorNodes[0], rootInspectorNode);
        const contentSourceNode = getPCNode(contentNode.sourceNodeId, graph);
        const variantTriggers = contentSourceNode.name === PCSourceTagNames.COMPONENT
            ? getComponentVariantTriggers(contentSourceNode)
            : EMPTY_ARRAY;
        const variants = contentSourceNode.name === PCSourceTagNames.COMPONENT
            ? getComponentVariants(contentSourceNode)
            : EMPTY_ARRAY;
        const showPropertiesTab = Boolean(contentSourceNode && isComponent(contentSourceNode));
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                propertiesTab: tab === Tab.PROPERTIES || !showPropertiesTab,
                triggersTab: tab === Tab.TRIGGERS && showPropertiesTab,
                showPropertiesTab
            }), behaviorProps: {
                dispatch,
                variants,
                variantTriggers,
                globalQueries
            }, propertiesTabButtonProps: {
                onClick: onPropertiesTabClick,
                title: "Styles"
            }, triggersTabButtonProps: {
                onClick: onTriggersTabClick,
                title: "Triggers"
            }, propertiesProps: {
                cwd,
                projectOptions,
                globalVariables,
                selectedVariant,
                dispatch,
                documentColors,
                computedStyleInfo,
                selectedInspectorNodes,
                rootInspectorNode,
                graph,
                fontFamilies
            }, styleSwitcherProps: {
                dispatch,
                rootInspectorNode,
                selectedInspectorNodes,
                graph,
                selectedVariant
            } })));
    }
};
//# sourceMappingURL=controller.js.map