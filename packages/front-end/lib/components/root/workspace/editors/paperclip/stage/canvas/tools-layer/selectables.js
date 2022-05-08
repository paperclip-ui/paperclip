import "./selectables.scss";
import * as React from "react";
export class SelectableToolsComponent extends React.PureComponent {
    render() {
        const { frames } = this.props;
        if (!frames) {
            return null;
        }
        return React.createElement("div", { className: "m-selectable-tools" });
    }
}
//# sourceMappingURL=selectables.js.map