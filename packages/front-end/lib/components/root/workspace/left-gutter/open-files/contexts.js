import * as React from "react";
export const LayersPaneContext = React.createContext(null);
export const withLayersPaneContext = function (computeProperties) {
    return (Base) => {
        return (props) => {
            return (React.createElement(LayersPaneContext.Consumer, null, (context) => (React.createElement(Base, Object.assign({}, props, computeProperties(props, context))))));
        };
    };
};
//# sourceMappingURL=contexts.js.map