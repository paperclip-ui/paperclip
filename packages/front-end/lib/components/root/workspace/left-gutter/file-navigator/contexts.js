import * as React from "react";
export const FileNavigatorContext = React.createContext(null);
export const withFileNavigatorContext = function (computeProperties) {
    return (Base) => {
        return (props) => {
            return (React.createElement(FileNavigatorContext.Consumer, null, (context) => (React.createElement(Base, Object.assign({}, props, computeProperties(props, context))))));
        };
    };
};
//# sourceMappingURL=contexts.js.map