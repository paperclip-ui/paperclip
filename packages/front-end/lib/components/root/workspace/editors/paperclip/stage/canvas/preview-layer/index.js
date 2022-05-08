/**
 * preview of all components & artboards
 */
import "./index.scss";
import * as React from "react";
import { DocumentPreviewComponent } from "./document";
import { getSyntheticNodeById } from "paperclip";
export class PreviewLayerComponent extends React.PureComponent {
    render() {
        const { frames, dependency, documents } = this.props;
        return (React.createElement("div", { className: "m-preview-layer" }, frames.map(frame => (React.createElement(DocumentPreviewComponent, { key: frame.syntheticContentNodeId, contentNode: getSyntheticNodeById(frame.syntheticContentNodeId, documents), frame: frame, dependency: dependency })))));
    }
}
//# sourceMappingURL=index.js.map