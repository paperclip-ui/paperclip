import * as React from "react";
import { styleVariantDropdownChanged, newStyleVariantButtonClicked, editVariantNameButtonClicked, removeVariantButtonClicked } from "../../../../../../actions";
import { getPCVariants, isComponent, getInspectorContentNode, getPCNode } from "paperclip";
export default (Base) => class StyleSwitcherController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onAddVariantButtonClick = () => {
            this.props.dispatch(newStyleVariantButtonClicked());
        };
        this.onRemoveVariantButtonClick = () => {
            this.props.dispatch(removeVariantButtonClicked());
        };
        this.onEditNameButtonClick = () => {
            this.props.dispatch(editVariantNameButtonClicked());
        };
        this.onStyleChange = value => {
            const contentNode = getInspectorContentNode(this.props.selectedInspectorNodes[0], this.props.rootInspectorNode);
            const component = getPCNode(contentNode.sourceNodeId, this.props.graph);
            this.props.dispatch(styleVariantDropdownChanged(value, component));
        };
    }
    render() {
        const { onRemoveVariantButtonClick, onAddVariantButtonClick, onEditNameButtonClick, onStyleChange } = this;
        const { selectedInspectorNodes, rootInspectorNode, graph, selectedVariant } = this.props;
        if (!selectedInspectorNodes) {
            return null;
        }
        const contentNode = getInspectorContentNode(selectedInspectorNodes[0], rootInspectorNode);
        const contentSourceNode = getPCNode(contentNode.sourceNodeId, graph);
        if (!contentSourceNode || !isComponent(contentSourceNode)) {
            return null;
        }
        const variants = getPCVariants(contentSourceNode);
        const options = [
            { value: undefined, label: "--" },
            ...variants.map(variant => {
                return {
                    value: variant,
                    label: variant.label || "Undefined"
                };
            })
        ];
        return (React.createElement(Base, { addStyleButtonProps: { onClick: onAddVariantButtonClick }, removeStyleButtonProps: {
                style: {
                    display: selectedVariant ? "block" : "none"
                },
                onClick: onRemoveVariantButtonClick
            }, editNameButtonProps: {
                style: {
                    display: selectedVariant ? "block" : "none"
                },
                onClick: onEditNameButtonClick
            }, dropdownProps: {
                value: variants.find(variant => variant.id === (selectedVariant && selectedVariant.id)),
                options,
                onChange: onStyleChange
            } }));
    }
};
//# sourceMappingURL=controller2.js.map