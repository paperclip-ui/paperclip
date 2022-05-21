import * as React from "react";
import * as ReactDOM from "react-dom";

type PortalOptions = {
  didMount?: (props) => (element: HTMLDivElement) => any;
};

type PortalProps = {
  style: any;
  children: any;
};

export const portal =
  ({ didMount }: PortalOptions = {}) =>
  () => {
    return class Portal extends React.Component<PortalProps> {
      private _mount: HTMLDivElement;

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
        return ReactDOM.createPortal(
          <div style={this.props.style}>{this.props.children}</div>,
          this._mount
        );
      }
    };
  };
