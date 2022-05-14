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
import { TreeNodeOperationalTransform } from "./ot";
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

    // TODO: remove this state! It should go n global state!
    let initedFrames = {};
    const frameNodeMap: KeyValue<SyntheticNativeNodeMap> = {};

    const handleRuntimeEvaluated = (
      action: Action,
      state: PCEditorState,
      prevState: PCEditorState
    ) => {
      if (action.type !== PC_RUNTIME_EVALUATED) {
        return;
      }
      const { diffs } = action as PCRuntimeEvaluated;

      const allDocUris = Object.keys(state.graph);

      for (const uri of allDocUris) {
        const newDocument = getSyntheticDocumentByDependencyUri(
          uri,
          state.documents,
          state.graph
        );

        if (!newDocument) {
          continue;
        }

        const ots = diffs[uri] || EMPTY_ARRAY;

        for (const newFrame of getSyntheticDocumentFrames(
          newDocument,
          state.frames
        )) {
          // container may not exist of project is reloaded
          if (
            !initedFrames[newFrame.syntheticContentNodeId] ||
            !newFrame.$container
          ) {
            initedFrames[newFrame.syntheticContentNodeId] = true;
            initContainer(newFrame, state);
          } else {
            const frameOts = mapContentNodeOperationalTransforms(
              newFrame.syntheticContentNodeId,
              newDocument,
              ots
            );
            const oldFrame =
              prevState &&
              prevState.frames.find(
                (oldFrame) =>
                  oldFrame.syntheticContentNodeId ===
                  newFrame.syntheticContentNodeId
              );

            // Equality check on bounds since that's the only prop needed for re-rendering the frame. Equality check
            // should !!NOT!! happen between frames (oldFrame !== newFrame) since patchContainer emits computed data
            // that updates the frame which would result in prevState to be out of sync.
            if (
              frameOts.length ||
              !oldFrame ||
              oldFrame.bounds !== newFrame.bounds
            ) {
              const oldDocument = getSyntheticDocumentByDependencyUri(
                uri,
                prevState.documents,
                prevState.graph
              );

              patchContainer(
                newFrame,
                getNestedTreeNodeById(
                  newFrame.syntheticContentNodeId,
                  oldDocument
                ) as SyntheticVisibleNode,
                frameOts
              );
            }
          }
        }
      }
    };

    const patchContainer = (
      frame: Frame,
      contentNode: SyntheticVisibleNode,
      ots: TreeNodeOperationalTransform[]
    ) => {
      const marker = pmark(`*patchContainer()`);
      const container: HTMLElement = frame.$container;
      const iframe = container.children[0] as HTMLIFrameElement;
      const body = iframe.contentDocument && iframe.contentDocument.body;
      if (!body) {
        marker.end();
        return;
      }

      frameNodeMap[frame.syntheticContentNodeId] = patchDOM(
        ots,
        contentNode,
        body,
        frameNodeMap[frame.syntheticContentNodeId]
      );

      dispatch(
        pcFrameRendered(
          frame,
          computeDisplayInfo(frameNodeMap[frame.syntheticContentNodeId])
        )
      );

      marker.end();
    };

    const initContainer = (frame: Frame, state: PCEditorState) => {
      const container = createContainer();

      // notify of the new container
      dispatch(pcFrameContainerCreated(frame, container));
      watchContainer(container, frame, state);
    };

    const watchContainer = (
      container: HTMLElement,
      frame: Frame,
      state: PCEditorState
    ) => {
      const iframe = container.children[0] as HTMLIFrameElement;

      if (!iframe) {
        return;
      }

      const onLoad = () => {
        const contentNode = getSyntheticNodeById(
          frame.syntheticContentNodeId,
          state.documents
        );
        const graph = state.graph;

        // happens on reload
        if (!iframe.contentDocument) {
          return;
        }
        const body = iframe.contentDocument.body;
        dispatch(
          pcFrameRendered(
            frame,
            computeDisplayInfo(
              (frameNodeMap[frame.syntheticContentNodeId] = renderDOM(
                body,
                contentNode
              ))
            )
          )
        );
      };

      const onUnload = () => {
        iframe.contentWindow.removeEventListener("unload", onUnload);
        resetContainer(container);
      };

      const onDone = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.addEventListener("unload", onUnload);
        }
        iframe.removeEventListener("load", onDone);
        onLoad();
      };

      iframe.addEventListener("load", onDone);
      if (iframe.contentDocument && iframe.contentDocument.body) {
        setImmediate(onDone);
      }

      watchContainer(container, frame, state);
    };

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
      handleRuntimeEvaluated(action, state, prevState);
      handleGraphChange(state);
      marker.end();
    };
  };

const mapContentNodeOperationalTransforms = (
  syntheticContentNodeId: string,
  document: SyntheticDocument,
  ots: TreeNodeOperationalTransform[]
) => {
  const index = document.children.findIndex(
    (child) => child.id === syntheticContentNodeId
  );
  return ots
    .filter((ot) => ot.nodePath[0] === index)
    .map((ot) => ({
      ...ot,
      nodePath: ot.nodePath.slice(1),
    }));
};

const createContainer = () => {
  if (typeof window === "undefined") return null;
  const container = document.createElement("div");
  container.appendChild(createIframe());
  return container;
};

const resetContainer = (container: HTMLElement) => {
  container.removeChild(container.children[0]);
  container.appendChild(createIframe());
};

const createIframe = () => {
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.background = "white";
  iframe.addEventListener("load", () => {
    iframe.contentDocument.body.style.margin = "0";
  });
  return iframe;
};
