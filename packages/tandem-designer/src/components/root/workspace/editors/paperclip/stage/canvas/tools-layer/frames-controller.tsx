import * as React from "react";
import { RootState, EditorWindow, Canvas } from "../../../../../../../../state";
import { wrapEventToDispatch } from "../../../../../../../../utils";
import { Dispatch } from "redux";
import { Translate } from "tandem-common";
import {
  getFramesByDependencyUri,
  getSyntheticNodeById,
  getSyntheticSourceNode,
  Frame,
  SyntheticDocument,
  DependencyGraph,
} from "paperclip";
import { Frame as FrameComponent } from "./frames-view.pc";
import { canvasToolWindowBackgroundClicked } from "../../../../../../../../actions";
import { BaseFramesProps } from "./frames-view.pc";

export type Props = {
  frames: Frame[];
  documents: SyntheticDocument[];
  graph: DependencyGraph;
  editorWindow: EditorWindow;
  dispatch: Dispatch<any>;
  translate: Translate;
  canvas: Canvas;
};

export default (Base: React.ComponentClass<BaseFramesProps>) =>
  class FramesController extends React.PureComponent<Props> {
    render() {
      const { translate, editorWindow, frames, graph, documents, dispatch } =
        this.props;
      const backgroundStyle = {
        transform: `translate(${-translate.left / translate.zoom}px, ${
          -translate.top / translate.zoom
        }px) scale(${1 / translate.zoom}) translateZ(0)`,
        transformOrigin: "top left",
      };

      const activeFrames = getFramesByDependencyUri(
        editorWindow.activeFilePath,
        frames,
        documents,
        graph
      );

      const frameComponents = activeFrames.map((frame: Frame, i) => {
        const contentNode = getSyntheticNodeById(
          frame.syntheticContentNodeId,
          documents
        );

        const sourceNode = getSyntheticSourceNode(contentNode, graph);
        return (
          <FrameComponent
            graph={graph}
            key={frame.syntheticContentNodeId}
            sourceNode={sourceNode}
            frame={frame}
            contentNode={contentNode}
            dispatch={dispatch}
            translate={translate}
          />
        );
      });

      return (
        <Base
          backgroundProps={{
            style: backgroundStyle,
            onClick: wrapEventToDispatch(
              dispatch,
              canvasToolWindowBackgroundClicked
            ),
          }}
          contentProps={{ children: frameComponents }}
        />
      );
    }
  };
