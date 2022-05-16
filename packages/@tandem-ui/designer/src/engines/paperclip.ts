import { memoize } from "lodash";
import {
  createRemotePCRuntime,
  getPCNodeModule,
  PCComponent,
  startPaperclipEngine,
} from "paperclip";
import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  getParentTreeNode,
  reuser,
} from "tandem-common";
import { getProjectCWD, RootState } from "../state";
const reuseUris = reuser(10, (uris: string[]) => uris.join(","));

const worker = new Worker(new URL("./paperclip.worker", import.meta.url));

export const startPaperclipTandemEngine = () =>
  startPaperclipEngine({
    createRuntime: () => createRemotePCRuntime(worker),
    getRootDirectory: (state: RootState) => getProjectCWD(state),
    getPriorityUris: (state: RootState) => {
      if (!state.editorWindows.length) {
        return EMPTY_ARRAY;
      }

      return reuseUris(state.openFiles.map((openFile) => openFile.uri));
    },
    getRuntimeVariants: (state: RootState) => {
      if (!state.selectedVariant) {
        return EMPTY_OBJECT;
      }
      const module = getPCNodeModule(state.selectedVariant.id, state.graph);
      // variant does not exist
      if (!module) {
        return EMPTY_OBJECT;
      }
      const component = getParentTreeNode(
        state.selectedVariant.id,
        module
      ) as PCComponent;
      return getVariants(component.id, state.selectedVariant.id);
    },
  });

const getVariants = memoize((componentId: string, variantId: string) => ({
  [componentId]: {
    [variantId]: true,
  },
}));
