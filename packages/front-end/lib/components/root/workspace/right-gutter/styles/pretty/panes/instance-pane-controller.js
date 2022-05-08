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
import { PCSourceTagNames, extendsComponent, getInspectorSourceNode, inspectorNodeInShadow, getTopMostInspectorInstance, getPCNodeContentNode, getPCNodeModule, getInstanceVariantInfo } from "paperclip";
import { dropdownMenuOptionFromValue } from "../../../../../../inputs/dropdown/controller";
import { cssResetPropertyOptionClicked, instanceVariantToggled } from "../../../../../../../actions";
import { containsNestedTreeNodeById, EMPTY_ARRAY } from "tandem-common";
import { VariantOption } from "../../variants/option.pc";
export default (Base) => class InstancePaneController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onResetStyle = (property) => {
            this.props.dispatch(cssResetPropertyOptionClicked(property));
        };
        this.onVariantToggle = (variant) => {
            this.props.dispatch(instanceVariantToggled(variant));
        };
    }
    render() {
        const { onResetStyle, onVariantToggle } = this;
        const _a = this.props, { selectedInspectorNodes, computedStyleInfo, rootInspectorNode, selectedVariant, dispatch, graph } = _a, rest = __rest(_a, ["selectedInspectorNodes", "computedStyleInfo", "rootInspectorNode", "selectedVariant", "dispatch", "graph"]);
        const selectedInspectorNode = selectedInspectorNodes[0];
        if (!selectedInspectorNode) {
            return null;
        }
        const sourceNode = getInspectorSourceNode(selectedInspectorNode, rootInspectorNode, graph);
        // may not exist for things like plugs
        if (!sourceNode) {
            return null;
        }
        const contentNode = getPCNodeContentNode(sourceNode.id, getPCNodeModule(sourceNode.id, graph));
        if (!contentNode) {
            return null;
        }
        if (sourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE &&
            (sourceNode.name !== PCSourceTagNames.COMPONENT ||
                !extendsComponent(sourceNode))) {
            if (!inspectorNodeInShadow(selectedInspectorNode, rootInspectorNode)) {
                // needs to show up within components particularly for variants
                if (contentNode.name !== PCSourceTagNames.COMPONENT) {
                    return null;
                }
            }
        }
        const instance = getTopMostInspectorInstance(selectedInspectorNode, rootInspectorNode);
        const instanceSourceNode = getInspectorSourceNode(instance, rootInspectorNode, graph);
        // if top most source node is not component or instance, then the target node is _not_ in a shadow
        const topMostSourceNode = instanceSourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE ||
            instanceSourceNode.name === PCSourceTagNames.COMPONENT
            ? instanceSourceNode
            : contentNode;
        const overrideKeys = [
            ...Object.keys(computedStyleInfo.style).filter(key => {
                const overrides = computedStyleInfo.styleOverridesMap[key] || EMPTY_ARRAY;
                const inCurrentInstance = overrides.some((override) => {
                    return (containsNestedTreeNodeById(override.id, topMostSourceNode) &&
                        override.variantId == (selectedVariant && selectedVariant.id));
                });
                // if variant is selected, then override must be present
                return (inCurrentInstance ||
                    (!selectedVariant &&
                        instanceSourceNode.style &&
                        Boolean(instanceSourceNode.style[key])));
            })
        ];
        if (sourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE &&
            (sourceNode.name !== PCSourceTagNames.COMPONENT ||
                !extendsComponent(sourceNode))) {
            return null;
        }
        const variantInfo = getInstanceVariantInfo(selectedInspectorNode, rootInspectorNode, graph, selectedVariant && selectedVariant.id);
        const options = variantInfo.map(({ variant, component, enabled }, i) => {
            return (React.createElement(VariantOption, { alt: Boolean(i % 2), enabled: enabled, key: variant.id, item: variant, switchProps: null, dispatch: dispatch, onToggle: onVariantToggle, graph: graph, component: component, instance: instanceSourceNode }));
        });
        return (React.createElement(Base, Object.assign({}, rest, { variantOptionProps: null, variantOptionProps1: null, variantOptionProps2: null, variantOptionProps3: null, variant: cx({
                hasOverrides: overrideKeys.length > 0
            }), resetDropdownProps: {
                options: overrideKeys.map(dropdownMenuOptionFromValue),
                onChangeComplete: onResetStyle
            }, content: options })));
    }
};
//# sourceMappingURL=instance-pane-controller.js.map