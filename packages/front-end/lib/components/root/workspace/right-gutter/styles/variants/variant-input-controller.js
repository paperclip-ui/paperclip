import * as React from "react";
import { getInstanceVariantInfo, PCSourceTagNames, extendsComponent } from "paperclip";
import { instanceVariantToggled } from "../../../../../../actions";
import { EMPTY_ARRAY } from "tandem-common";
export default (Base) => class VariantInputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onVariantToggle = (variant) => {
            this.props.dispatch(instanceVariantToggled(variant));
        };
    }
    render() {
        const { onVariantToggle } = this;
        const { selectedInspectorNode, rootInspectorNode, graph, sourceNode, selectedVariant, dispatch } = this.props;
        if (sourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE &&
            (sourceNode.name !== PCSourceTagNames.COMPONENT ||
                !extendsComponent(sourceNode))) {
            return null;
        }
        const variantInfo = getInstanceVariantInfo(selectedInspectorNode, rootInspectorNode, graph, selectedVariant && selectedVariant.id);
        if (!variantInfo.length) {
            return null;
        }
        const options = EMPTY_ARRAY;
        return React.createElement(Base, { options: options });
    }
};
//# sourceMappingURL=variant-input-controller.js.map