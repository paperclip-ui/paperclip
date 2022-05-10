import "./document.scss";
import * as React from "react";
import { Frame, Dependency, SyntheticVisibleNode } from "paperclip";

export type DocumentPreviewOuterProps = {
  frame: Frame;
  dependency: Dependency<any>;
  contentNode: SyntheticVisibleNode;
};

type DesignPreviewOuterProps = {
  frame: Frame;
  dependency: Dependency<any>;
};

class DesignPreview extends React.PureComponent<DesignPreviewOuterProps> {
  componentDidUpdate({ frame: oldFrame }: DocumentPreviewOuterProps) {
    const props = this.props;
    if (!oldFrame || oldFrame.$container !== props.frame.$container) {
      const container = this.refs.container as HTMLElement;
      while (container.childNodes.length) {
        container.removeChild(container.childNodes[0]);
      }
      if (props.frame.$container) {
        container.appendChild(props.frame.$container);
      }
    }
  }
  componentDidMount() {
    const container = this.refs.container as HTMLElement;
    if (container && this.props.frame.$container) {
      container.appendChild(
        (this.props as DocumentPreviewOuterProps).frame.$container
      );
    }
  }
  render() {
    return <div ref="container" />;
  }
}

export class DocumentPreviewComponent extends React.PureComponent<DocumentPreviewOuterProps> {
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
      background: "white",
    } as any;

    return (
      <div className="m-preview-document" style={style}>
        <DesignPreview frame={frame} dependency={dependency} />
      </div>
    );
  }
}
