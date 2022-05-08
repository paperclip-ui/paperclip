import * as React from "react";
import { componentPickerBackgroundClick } from "../../actions";
export default (Base) => class ModalController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onBackgroundClick = () => {
            this.props.dispatch(componentPickerBackgroundClick());
        };
    }
    render() {
        const { root, dispatch } = this.props;
        const { onBackgroundClick } = this;
        // if (root.toolType === ToolType.COMPONENT && !root.selectedComponentId) {
        //   return (
        //     <Base
        //       backgroundProps={{
        //         onClick: onBackgroundClick
        //       }}
        //       pickerProps={{
        //         root,
        //         dispatch
        //       }}
        //     />
        //   );
        // }
        return null;
    }
};
//# sourceMappingURL=modal-controller.js.map