import * as React from "react";
import * as ReactDOM from "react-dom";

export type DraggableProps = {
  onDrag: (
    ops: { px: number; py: number; width: number; height: number }
  ) => any;
  onDragStop?: () => any;
  children: any;
};

export class DraggableComponent extends React.Component<DraggableProps, any> {
  private _element: HTMLElement;
  componentDidMount() {}
  onMouseDown = (event: React.MouseEvent<any>) => {
    this._element = ReactDOM.findDOMNode(this) as HTMLElement;
    document.body.addEventListener("mouseup", this.onMouseUp);
    document.body.addEventListener("mousemove", this.onMouseMove);
  };
  onMouseMove = (event: MouseEvent) => {
    const element = this._element;
    const prect = element.getBoundingClientRect();
    const rx = Math.min(
      prect.right - prect.left,
      Math.max(0, event.clientX - prect.left)
    );
    const ry = Math.min(
      prect.bottom - prect.top,
      Math.max(0, event.clientY - prect.top)
    );
    this.props.onDrag({
      px: rx / prect.width,
      py: ry / prect.height,
      width: prect.width,
      height: prect.height
    });
  };
  onMouseUp = (event: MouseEvent) => {
    document.body.removeEventListener("mouseup", this.onMouseUp);
    document.body.removeEventListener("mousemove", this.onMouseMove);
    if (this.props.onDragStop) {
      this.props.onDragStop();
    }
  };
  render() {
    return <span onMouseDown={this.onMouseDown}>{this.props.children}</span>;
  }
}
