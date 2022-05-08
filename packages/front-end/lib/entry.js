import { init } from "./index";
import { createRootInspectorNode } from "paperclip";
import { EditMode, RootReadyType } from "./state";
init({
    mount: document.getElementById("application"),
    editorWindows: [],
    customChrome: false,
    selectedInspectorNodes: [],
    hoveringInspectorNodes: [],
    unloaders: [],
    readyType: RootReadyType.LOADING,
    scriptProcesses: [],
    editMode: EditMode.PRIMARY,
    selectedFileNodeIds: [],
    sourceNodeInspector: createRootInspectorNode(),
    sourceNodeInspectorMap: {},
    history: {
        index: 0,
        items: []
    },
    openFiles: [],
    frames: [],
    documents: [],
    graph: {},
    fileCache: {},
    selectedComponentId: null
});
//# sourceMappingURL=entry.js.map