import * as React from "react";
export default (Base) => (props) => {
    return React.createElement(Base, Object.assign({}, props, { inset: true }));
};
//# sourceMappingURL=box-shadows-inner-controller.js.map