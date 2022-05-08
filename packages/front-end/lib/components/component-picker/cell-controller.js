import * as React from "react";
export default (Base) => class CellController extends React.PureComponent {
    render() {
        return React.createElement(Base, Object.assign({}, this.props));
    }
};
//# sourceMappingURL=cell-controller.js.map