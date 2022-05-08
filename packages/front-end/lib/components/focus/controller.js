import * as React from "react";
import { FocusComponent } from "./index";
export default (Base) => class FocusController extends React.PureComponent {
    render() {
        return (React.createElement(FocusComponent, Object.assign({}, this.props),
            React.createElement(Base, Object.assign({}, this.props))));
    }
};
//# sourceMappingURL=controller.js.map