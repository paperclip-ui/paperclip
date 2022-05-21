/**
 * preview of all components & artboards
 */

import "./index.scss";
import * as React from "react";
import { DocumentPreviewComponent } from "./document";
import {
  Frame,
  Dependency,
  SyntheticDocument,
  getSyntheticDocumentById,
  getSyntheticNodeById,
} from "paperclip";

export type PreviewLayerOuterProps = {
  frames: Frame[];
  documents: SyntheticDocument[];
  dependency: Dependency<any>;
};

export class PreviewLayerComponent extends React.PureComponent<PreviewLayerOuterProps> {
  render() {
    const { frames, dependency, documents } = this.props;
    return (
      <div className="m-preview-layer">
        {frames.map((frame) => (
          <DocumentPreviewComponent
            key={frame.syntheticContentNodeId}
            contentNode={getSyntheticNodeById(
              frame.syntheticContentNodeId,
              documents
            )}
            frame={frame}
            dependency={dependency}
          />
        ))}
      </div>
    );
  }
}
