import * as React from "react";
import * as ReactDOM from "react-dom";
export class DraggableComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onMouseDown = (event) => {
            this._element = ReactDOM.findDOMNode(this);
            document.body.addEventListener("mouseup", this.onMouseUp);
            document.body.addEventListener("mousemove", this.onMouseMove);
        };
        this.onMouseMove = (event) => {
            const element = this._element;
            const prect = element.getBoundingClientRect();
            const rx = Math.min(prect.right - prect.left, Math.max(0, event.clientX - prect.left));
            const ry = Math.min(prect.bottom - prect.top, Math.max(0, event.clientY - prect.top));
            this.props.onDrag({
                px: rx / prect.width,
                py: ry / prect.height,
                width: prect.width,
                height: prect.height
            });
        };
        this.onMouseUp = (event) => {
            document.body.removeEventListener("mouseup", this.onMouseUp);
            document.body.removeEventListener("mousemove", this.onMouseMove);
            if (this.props.onDragStop) {
                this.props.onDragStop();
            }
        };
    }
    componentDidMount() { }
    render() {
        return React.createElement("span", { onMouseDown: this.onMouseDown }, this.props.children);
    }
}
//# sourceMappingURL=index.js.map