import { fsCacheBusy } from "fsbox";
import { Action, Dispatch } from "redux";
import {
  EMPTY_ARRAY,
  getNestedTreeNodeById,
  KeyValue,
  memoize,
  pmark,
} from "tandem-common";
import {
  pcFrameContainerCreated,
  pcFrameRendered,
  PCRuntimeEvaluated,
  pcRuntimeEvaluated,
  PC_RUNTIME_EVALUATED,
} from "./actions";
import {
  computeDisplayInfo,
  patchDOM,
  renderDOM,
  SyntheticNativeNodeMap,
} from "./dom-renderer";
import { Frame, getSyntheticDocumentFrames, PCEditorState } from "./edit";
import { DependencyGraph } from "./graph";
import { patchTreeNode, TreeNodeOperationalTransform } from "./ot";
import { PCRuntime, LocalRuntimeInfo } from "./runtime";
import {
  getSyntheticDocumentByDependencyUri,
  getSyntheticNodeById,
  SyntheticDocument,
  SyntheticInstanceMap,
  SyntheticNode,
  SyntheticVisibleNode,
} from "./synthetic";

export type PaperclipEngineOptions = {
  createRuntime(): PCRuntime;
  getPriorityUris(state: PCEditorState): string[];
  getRootDirectory(state: PCEditorState): string;
  getRuntimeVariants(
    state: PCEditorState
  ): Record<string, Record<string, boolean>>;
};

const getRuntimeInfo = memoize(
  (
    graph: DependencyGraph,
    rootDirectory: string,
    variants: KeyValue<KeyValue<boolean>>,
    priorityUris: string[]
  ): LocalRuntimeInfo => {
    return {
      graph,
      rootDirectory,
      variants,
      priorityUris,
    };
  }
);

export const startPaperclipEngine =
  ({
    createRuntime,
    getRootDirectory,
    getRuntimeVariants,
    getPriorityUris,
  }: PaperclipEngineOptions) =>
  (dispatch: Dispatch<Action>) => {
    const rt = createRuntime();

    rt.on("evaluate", (newDocuments, diffs, deletedDocumentIds, timestamp) => {
      dispatch(
        pcRuntimeEvaluated(
          newDocuments,
          diffs,
          rt.syntheticDocuments,
          timestamp < rt.lastUpdatedAt
        )
      );
    });

    const handleGraphChange = (state: PCEditorState) => {
      if (fsCacheBusy(state.fileCache)) {
        return;
      }
      rt.setInfo(
        getRuntimeInfo(
          state.graph,
          getRootDirectory(state),
          getRuntimeVariants(state),
          getPriorityUris(state)
        )
      );
    };

    return (action: Action, state: PCEditorState, prevState: PCEditorState) => {
      const marker = pmark(`[PapeclipEngine] handle action`);
      // handleRuntimeEvaluated(action, state, prevState);
      handleGraphChange(state);
      marker.end();
    };
  };
