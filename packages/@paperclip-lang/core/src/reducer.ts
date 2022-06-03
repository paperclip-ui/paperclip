import { Action } from "redux";
import {
  queueOpenFiles,
  FSSandboxRootState,
  FS_SANDBOX_ITEM_LOADED,
  FSSandboxItemLoaded,
  queueOpenFile,
  FILE_CHANGED,
  FileChangedEventType,
} from "fsbox";
import {
  PC_SYNTHETIC_FRAME_RENDERED,
  PCFrameRendered,
  PC_SYNTHETIC_FRAME_CONTAINER_CREATED,
  PCFrameContainerCreated,
  PC_SOURCE_FILE_URIS_RECEIVED,
  PCSourceFileUrisReceived,
  PC_RUNTIME_EVALUATED,
  PCRuntimeEvaluated,
} from "./actions";
import {
  getFrameByContentNodeId,
  PCEditorState,
  pruneDependencyGraph,
  updateFrame,
  upsertFrames,
} from "./edit";
import { addFileCacheItemToDependencyGraph, isPaperclipUri } from "./graph";
import { PAPERCLIP_MIME_TYPE } from "./constants";

export const paperclipReducer = <
  TState extends PCEditorState & FSSandboxRootState
>(
  state: TState,
  action: Action
): TState => {
  switch (action.type) {
    case PC_SYNTHETIC_FRAME_CONTAINER_CREATED: {
      const { frame } = action as PCFrameContainerCreated;
      return updateFrame(
        {
          // $container,
          computed: null,
        },
        frame,
        state
      );
    }
    case PC_RUNTIME_EVALUATED: {
      const { allDocuments, catchingUp } = action as PCRuntimeEvaluated;
      if (catchingUp) {
        return state;
      }
      return upsertFrames({
        ...Object(state as any),
        documents: allDocuments,
      });
    }
    case PC_SOURCE_FILE_URIS_RECEIVED: {
      const { uris } = action as PCSourceFileUrisReceived;
      state = queueOpenFiles(uris, state);
      return pruneDependencyGraph(state as any);
    }
    case PC_SYNTHETIC_FRAME_RENDERED: {
      const { syntheticContentNodeId, computed } = action as PCFrameRendered;
      return updateFrame(
        {
          computed,
        },
        getFrameByContentNodeId(syntheticContentNodeId, state.frames),
        state
      );
    }

    // ick, this needs to be strongly typed and pulled fron fsbox. Currently
    // living in front-end
    case FILE_CHANGED: {
      const { uri, eventType } = action as any;
      if (isPaperclipUri(uri)) {
        if (eventType === FileChangedEventType.UNLINK) {
          const newGraph = { ...state.graph };
          delete newGraph[uri];
          state = {
            ...(state as any),
            graph: newGraph,
          };
        } else if (eventType === FileChangedEventType.ADD) {
          state = queueOpenFile(uri, state);
        }
      }
      return state;
    }
    case FS_SANDBOX_ITEM_LOADED: {
      const { uri, content, mimeType } = action as FSSandboxItemLoaded;

      // dependency graph can only load files that are within the scope of the project via PC_SOURCE_FILE_URIS_RECEIVED
      if (mimeType !== PAPERCLIP_MIME_TYPE) {
        return state;
      }

      let graph = addFileCacheItemToDependencyGraph(
        { uri, content },
        state.graph
      );

      state = pruneDependencyGraph({ ...(state as any), graph });

      return state;
    }
  }
  return state;
};
