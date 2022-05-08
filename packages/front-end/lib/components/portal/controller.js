import * as React from "react";
import * as ReactDOM from "react-dom";
export const portal = ({ didMount } = {}) => () => {
    return class Portal extends React.Component {
        constructor(props) {
            super(props);
            this._mount = document.createElement("div");
        }
        componentDidMount() {
            document.body.appendChild(this._mount);
            // Ugly fix around unmounted child nodes 🙈
            setImmediate(() => {
                didMount(this.props)(this._mount);
            });
        }
        componentWillUnmount() {
            this._mount.remove();
        }
        render() {
            return ReactDOM.createPortal(React.createElement("div", { style: this.props.style }, this.props.children), this._mount);
        }
    };
};
//# sourceMappingURL=controller.js.map