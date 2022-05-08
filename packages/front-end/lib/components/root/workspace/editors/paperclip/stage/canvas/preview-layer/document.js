import "./document.scss";
import * as React from "react";
class DesignPreview extends React.PureComponent {
    componentDidUpdate({ frame: oldFrame }) {
        const props = this.props;
        if (!oldFrame || oldFrame.$container !== props.frame.$container) {
            const container = this.refs.container;
            while (container.childNodes.length) {
                container.removeChild(container.childNodes[0]);
            }
            if (props.frame.$container) {
                container.appendChild(props.frame.$container);
            }
        }
    }
    componentDidMount() {
        const container = this.refs.container;
        if (container && this.props.frame.$container) {
            container.appendChild(this.props.frame.$container);
        }
    }
    render() {
        return React.createElement("div", { ref: "container" });
    }
}
export class DocumentPreviewComponent extends React.PureComponent {
    render() {
        const { contentNode, frame, dependency } = this.props;
        if (!contentNode) {
            return null;
        }
        const bounds = frame.bounds;
        if (!bounds) {
            return null;
        }
        const style = {
            position: "absolute",
            left: bounds.left,
            top: bounds.top,
            width: bounds.right - bounds.left,
            height: bounds.bottom - bounds.top,
            background: "white"
        };
        return (React.createElement("div", { className: "m-preview-document", style: style },
            React.createElement(DesignPreview, { frame: frame, dependency: dependency })));
    }
}
//# sourceMappingURL=document.js.map