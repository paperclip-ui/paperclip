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
} from "@paperclip-lang/core";
import * as styles from "./styles";

export type PreviewLayerOuterProps = {
  frames: Frame[];
  documents: SyntheticDocument[];
};

export class PreviewLayerComponent extends React.PureComponent<PreviewLayerOuterProps> {
  render() {
    const { frames, documents } = this.props;
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
          />
        ))}
      </styles.PreviewLayer>
    );
  }
}
