import * as React from "react";
import * as ReactDOM from "react-dom";
export class FocusComponent extends React.Component {
    componentDidMount() {
        if (this.props.focus !== false) {
            this.focus();
        }
    }
    componentWillReceiveProps({ focus }, context) {
        if (this.props.focus !== focus && focus) {
            this.focus();
        }
    }
    focus() {
        setTimeout(() => {
            const self = ReactDOM.findDOMNode(this);
            const input = self.tagName === "INPUT"
                ? self
                : self.querySelector("input");
            input.select();
        }, 10);
    }
    render() {
        return this.props.children;
    }
}
//# sourceMappingURL=index.js.map