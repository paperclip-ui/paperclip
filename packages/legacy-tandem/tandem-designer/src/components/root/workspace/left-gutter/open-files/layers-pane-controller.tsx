import * as React from "react";
import { memoize } from "tandem-common";
import {
  getSyntheticDocumentByDependencyUri,
  DependencyGraph,
  getPCNodeDependency,
  getPCNode,
  SyntheticDocument,
} from "paperclip";
import { InspectorNode } from "paperclip";
import { Dispatch } from "redux";
import { BaseLayersPaneProps } from "./view.pc";
import { OpenModule } from "./open-module.pc";
import { LayersPaneContext, LayersPaneContextProps } from "./contexts";

export type Props = {
  graph: DependencyGraph;
  hoveringInspectorNodes: InspectorNode[];
  selectedInspectorNodes: InspectorNode[];
  sourceNodeInspector: InspectorNode;
  renameInspectorNodeId: string;
  documents: SyntheticDocument[];
  dispatch: Dispatch<any>;
};

const generateLayersPaneContext = memoize(
  (
    graph: DependencyGraph,
    selectedInspectorNodes: InspectorNode[],
    hoveringInspectorNodes: InspectorNode[],
    renameInspectorNodeId: string,
    rootInspectorNode: InspectorNode,
    dispatch: Dispatch
  ): LayersPaneContextProps => {
    return {
      graph,
      rootInspectorNode,
      renameInspectorNodeId,
      selectedInspectorNodes,
      hoveringInspectorNodes,
      dispatch,
    };
  }
);

const CONTENT_STYLE = {
  display: "inline-block",
  minWidth: "100%",
};

export default (Base: React.ComponentClass<BaseLayersPaneProps>) =>
  class LayersPaneController extends React.PureComponent<Props> {
    render() {
      const {
        sourceNodeInspector,
        graph,
        documents,
        dispatch,
        selectedInspectorNodes,
        hoveringInspectorNodes,
        renameInspectorNodeId,
        ...rest
      } = this.props;

      const content = (
        <div style={CONTENT_STYLE}>
          {sourceNodeInspector.children.map((inspectorNode, i) => {
            const sourceNode = getPCNode(inspectorNode.sourceNodeId, graph);

            if (!sourceNode) {
              return null;
            }
            const dependency = getPCNodeDependency(sourceNode.id, graph);
            const document = getSyntheticDocumentByDependencyUri(
              dependency.uri,
              documents,
              graph
            );
            return (
              <LayersPaneContext.Provider
                key={inspectorNode.id}
                value={generateLayersPaneContext(
                  graph,
                  selectedInspectorNodes,
                  hoveringInspectorNodes,
                  renameInspectorNodeId,
                  sourceNodeInspector,
                  dispatch
                )}
              >
                <OpenModule inspectorNode={inspectorNode} />
              </LayersPaneContext.Provider>
            );
          })}
        </div>
      );

      return <Base {...rest} contentProps={{ children: content }} />;
    }
  };
