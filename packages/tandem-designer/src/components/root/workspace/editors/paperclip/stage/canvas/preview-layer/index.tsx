/**
 * preview of all components & artboards
 */

import * as React from "react";
import { DocumentPreviewComponent } from "./document";
import {
  Frame,
  Dependency,
  SyntheticDocument,
  getSyntheticDocumentById,
  getSyntheticNodeById,
} from "paperclip";
import * as styles from "./styles";

export type PreviewLayerOuterProps = {
  frames: Frame[];
  documents: SyntheticDocument[];
  dependency: Dependency<any>;
};

export class PreviewLayerComponent extends React.PureComponent<PreviewLayerOuterProps> {
  render() {
    const { frames, dependency, documents } = this.props;
    return (
      <styles.PreviewLayer>
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
      </styles.PreviewLayer>
    );
  }
}
