import * as React from "react";
import { getPCNode, isComponent, getInspectorContentNode } from "paperclip";
import { EMPTY_ARRAY } from "tandem-common";
export default (Base) => class VariantsController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onAddVariantButtonClick = () => { };
        this.onRemoveVariantButtonClick = () => { };
    }
    render() {
        const { onRemoveVariantButtonClick, onAddVariantButtonClick } = this;
        const { dispatch, selectedInspectorNodes, rootInspectorNode, graph, selectedVariant } = this.props;
        const contentNode = getInspectorContentNode(selectedInspectorNodes[0], rootInspectorNode);
        const contentSourceNode = getPCNode(contentNode.sourceNodeId, graph);
        if (!contentSourceNode || !isComponent(contentSourceNode)) {
            return null;
        }
        const variantOptions = EMPTY_ARRAY;
        return (React.createElement(Base, { removeVariantButtonProps: {
                onClick: onRemoveVariantButtonClick,
                style: {
                    display: selectedVariant ? "block" : "none"
                }
            }, addVariantButtonProps: {
                onClick: onAddVariantButtonClick
            }, listProps: {
                children: variantOptions
            } }));
    }
};
//# sourceMappingURL=controller.js.map