import "./selectables.scss";
import * as React from "react";
import { Frame } from "paperclip";

export type SelectableToolsOuterProps = {
  frames: Frame[];
};

export class SelectableToolsComponent extends React.PureComponent<SelectableToolsOuterProps> {
  render() {
    const { frames } = this.props;

    if (!frames) {
      return null;
    }

    return <div className="m-selectable-tools" />;
  }
}
