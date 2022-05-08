import * as path from "path";
import { arraySplice, memoize, EMPTY_ARRAY, pointIntersectsBounds, getSmallestBounds, mergeBounds, getNestedTreeNodeById, stripProtocol, getParentTreeNode, getBoundsSize, centerTransformZoom, createZeroBounds, getTreeNodePath, updateNestedNodeTrail, getTreeNodeFromPath, EMPTY_OBJECT, findNestedNode, findTreeNodeParent, containsNestedTreeNodeById, updateProperties, addProtocol, FILE_PROTOCOL } from "tandem-common";
import { getSyntheticSourceNode, getPCNodeDependency, getSyntheticNodeById, getSyntheticVisibleNodeDocument, getSyntheticDocumentDependencyUri, getSyntheticVisibleNodeRelativeBounds, updateDependencyGraph, updateSyntheticVisibleNodeMetadata, diffTreeNode, TreeNodeOperationalTransformType, PCSourceTagNames, patchTreeNode, updateSyntheticDocument, getFramesByDependencyUri, getPCNode, isPCComponentInstance, getPCNodeModule, getSyntheticInstancePath, syntheticNodeIsInShadow, isSlot, getModifiedDependencies, inspectorNodeInShadow, getInspectorContentNodeContainingChild, getInspectorNodeParentShadow, InspectorTreeNodeName, expandInspectorNodeById, getInspectorContentNode, getInspectorSyntheticNode, getSyntheticDocumentByDependencyUri, getPCNodeClip } from "paperclip";
import { uniq, values, clamp, last } from "lodash";
import { queueOpenFile, hasFileCacheItem } from "fsbox";
import { refreshInspectorTree, getSyntheticInspectorNode, getInsertableInspectorNode } from "paperclip";
export var ToolType;
(function (ToolType) {
    ToolType[ToolType["TEXT"] = 0] = "TEXT";
    ToolType[ToolType["POINTER"] = 1] = "POINTER";
    ToolType[ToolType["COMPONENT"] = 2] = "COMPONENT";
    ToolType[ToolType["ELEMENT"] = 3] = "ELEMENT";
})(ToolType || (ToolType = {}));
export var FrameMode;
(function (FrameMode) {
    FrameMode["PREVIEW"] = "preview";
    FrameMode["DESIGN"] = "design";
})(FrameMode || (FrameMode = {}));
export const REGISTERED_COMPONENT = "REGISTERED_COMPONENT";
export const SNAPSHOT_GAP = 50;
export var SyntheticVisibleNodeMetadataKeys;
(function (SyntheticVisibleNodeMetadataKeys) {
    SyntheticVisibleNodeMetadataKeys["EDITING_LABEL"] = "editingLabel";
})(SyntheticVisibleNodeMetadataKeys || (SyntheticVisibleNodeMetadataKeys = {}));
export var ConfirmType;
(function (ConfirmType) {
    ConfirmType[ConfirmType["ERROR"] = 0] = "ERROR";
    ConfirmType[ConfirmType["WARNING"] = 1] = "WARNING";
    ConfirmType[ConfirmType["SUCCESS"] = 2] = "SUCCESS";
})(ConfirmType || (ConfirmType = {}));
export var QuickSearchResultType;
(function (QuickSearchResultType) {
    QuickSearchResultType["URI"] = "uri";
    QuickSearchResultType["COMPONENT"] = "component";
})(QuickSearchResultType || (QuickSearchResultType = {}));
export const IS_WINDOWS = typeof navigator != null ? navigator.appVersion.indexOf("Win") !== -1 : false;
export const IS_MAC_OS = typeof navigator != null ? navigator.appVersion.indexOf("Mac") !== -1 : false;
export var ContextMenuOptionType;
(function (ContextMenuOptionType) {
    ContextMenuOptionType["GROUP"] = "group";
    ContextMenuOptionType["ITEM"] = "item";
})(ContextMenuOptionType || (ContextMenuOptionType = {}));
export var EditMode;
(function (EditMode) {
    EditMode[EditMode["PRIMARY"] = 0] = "PRIMARY";
    EditMode[EditMode["SECONDARY"] = 1] = "SECONDARY";
})(EditMode || (EditMode = {}));
export var RootReadyType;
(function (RootReadyType) {
    RootReadyType[RootReadyType["LOADING"] = 0] = "LOADING";
    RootReadyType[RootReadyType["LOADED"] = 1] = "LOADED";
    RootReadyType[RootReadyType["UNLOADING"] = 2] = "UNLOADING";
})(RootReadyType || (RootReadyType = {}));
export var AddFileType;
(function (AddFileType) {
    AddFileType[AddFileType["BLANK"] = 0] = "BLANK";
    AddFileType[AddFileType["COMPONENT"] = 1] = "COMPONENT";
    AddFileType[AddFileType["DIRECTORY"] = 2] = "DIRECTORY";
})(AddFileType || (AddFileType = {}));
export const updateRootState = (properties, root) => updateProperties(properties, root);
export const deselectRootProjectFiles = (state) => updateRootState({
    selectedFileNodeIds: []
}, state);
export const persistRootState = (persistPaperclipState, state) => {
    const oldGraph = state.prevGraph || state.graph;
    state = updateRootState(persistPaperclipState(state), state);
    state = keepActiveFileOpen(state);
    const modifiedDeps = getModifiedDependencies(state.graph, oldGraph);
    state = addHistory(oldGraph, state.graph, state);
    state = modifiedDeps.reduce((state, dep) => setOpenFileContent(dep, state), state);
    state = refreshModuleInspectorNodes(state);
    return state;
};
const getUpdatedInspectorNodes = (newState, oldState, scope) => {
    const MAX_DEPTH = 1;
    const oldScope = getNestedTreeNodeById(scope.id, oldState.sourceNodeInspector);
    const newScope = getNestedTreeNodeById(scope.id, newState.sourceNodeInspector);
    let newInspectorNodes = [];
    let model = oldScope;
    diffTreeNode(oldScope, newScope).forEach(ot => {
        const target = getTreeNodeFromPath(ot.nodePath, model);
        model = patchTreeNode([ot], model);
        if (ot.nodePath.length > MAX_DEPTH) {
            return;
        }
        // TODO - will need to check if new parent is not in an instance of a component.
        // Will also need to consider child overrides though.
        if (ot.type === TreeNodeOperationalTransformType.INSERT_CHILD) {
            newInspectorNodes.push(ot.child);
        }
        else if (ot.type === TreeNodeOperationalTransformType.SET_PROPERTY &&
            ot.name === "source") {
            newInspectorNodes.push(target);
        }
    });
    // ensure that content nodes are not selected.
    newInspectorNodes = newInspectorNodes.map(node => {
        return node.name === InspectorTreeNodeName.CONTENT
            ? node.children[0]
            : node;
    });
    return uniq(newInspectorNodes);
};
export const selectInsertedSyntheticVisibleNodes = (oldState, newState, scope, onlyOne = true) => {
    let insertedNodes = getUpdatedInspectorNodes(newState, oldState, scope);
    if (onlyOne && insertedNodes.length) {
        insertedNodes = [last(insertedNodes)];
    }
    return setSelectedInspectorNodes(newState, insertedNodes);
};
export const getInsertableSourceNodeFromSyntheticNode = memoize((node, document, graph) => {
    const sourceNode = getSyntheticSourceNode(node, graph);
    if (syntheticNodeIsInShadow(node, document, graph)) {
        const module = getPCNodeModule(sourceNode.id, graph);
        const instancePath = getSyntheticInstancePath(node, document, graph);
        const instancePCComponent = getPCNode(getPCNode(instancePath[0], graph).is, graph);
        const slot = findTreeNodeParent(sourceNode.id, module, (parent) => isSlot(parent));
        return slot && containsNestedTreeNodeById(slot.id, instancePCComponent)
            ? slot
            : null;
    }
    else if (sourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE &&
        sourceNode.name !== PCSourceTagNames.TEXT) {
        return sourceNode;
    }
    return null;
});
export const getInsertableSourceNodeScope = memoize((insertableSourceNode, relative, rootInspectorNode, document, graph) => {
    const containsSource = (current) => {
        const sourceNode = getSyntheticSourceNode(current, graph);
        return containsNestedTreeNodeById(insertableSourceNode.id, sourceNode);
    };
    if (containsSource(relative)) {
        return getSyntheticInspectorNode(relative, document, rootInspectorNode, graph);
    }
    return getSyntheticInspectorNode(findTreeNodeParent(relative.id, document, containsSource), document, rootInspectorNode, graph);
});
export const teeHistory = (state) => {
    if (state.prevGraph) {
        return state;
    }
    return Object.assign(Object.assign({}, state), { prevGraph: state.graph });
};
export const getBuildScriptProcess = (state) => state.scriptProcesses.find(process => process.id === state.buildScriptProcessId);
export const getSyntheticRelativesOfParentSource = memoize((node, parentSourceNode, documents, graph) => {
    const document = getSyntheticVisibleNodeDocument(node.id, documents);
    const module = getPCNodeModule(parentSourceNode.id, graph);
    const relatedParent = findTreeNodeParent(node.id, document, (parent) => {
        const sourceNode = getSyntheticSourceNode(parent, graph);
        return (getParentTreeNode(sourceNode.id, module).id === parentSourceNode.id);
    });
    const relatedParentParent = getParentTreeNode(relatedParent.id, document);
    return relatedParentParent.children.filter((child) => {
        const sourceNode = getSyntheticSourceNode(child, graph);
        return (getParentTreeNode(sourceNode.id, module).id === parentSourceNode.id);
    });
});
const setOpenFileContent = (dep, state) => updateOpenFile({
    temporary: false,
    newContent: new Buffer(JSON.stringify(dep.content, null, 2), "utf8")
}, dep.uri, state);
const addHistory = (oldGraph, newGraph, state) => {
    const items = state.history.items.slice(0, state.history.index);
    const prevSnapshotItem = getNextHistorySnapshot(items);
    if (!items.length ||
        (prevSnapshotItem &&
            items.length - items.indexOf(prevSnapshotItem) > SNAPSHOT_GAP)) {
        items.push({
            snapshot: oldGraph
        });
    }
    const currentGraph = getGraphAtHistoricPoint(items);
    const modifiedDeps = getModifiedDependencies(newGraph, currentGraph);
    const transforms = {};
    for (const dep of modifiedDeps) {
        transforms[dep.uri] = diffTreeNode(currentGraph[dep.uri].content, dep.content, EMPTY_OBJECT);
    }
    return updateRootState({
        prevGraph: null,
        history: {
            index: items.length + 1,
            items: [
                ...items,
                {
                    transforms
                }
            ]
        }
    }, state);
};
export const getGlobalFileUri = (info) => {
    const globalRelativeFilePath = (info && info.config.globalFilePath) || info.config.mainFilePath;
    return (globalRelativeFilePath &&
        addProtocol(FILE_PROTOCOL, path.join(path.dirname(info.path), globalRelativeFilePath)));
};
const getNextHistorySnapshot = (items) => {
    for (let i = items.length; i--;) {
        const prevHistoryItem = items[i];
        if (prevHistoryItem.snapshot) {
            return items[i];
        }
    }
};
const getGraphAtHistoricPoint = (allItems, index = allItems.length) => {
    const items = allItems.slice(0, index);
    const snapshotItem = getNextHistorySnapshot(items);
    const snapshotIndex = items.indexOf(snapshotItem);
    const transformItems = items.slice(snapshotIndex + 1);
    const graphSnapshot = transformItems.reduce((graph, { transforms }) => {
        const newGraph = Object.assign({}, graph);
        for (const uri in transforms) {
            newGraph[uri] = Object.assign(Object.assign({}, newGraph[uri]), { content: patchTreeNode(transforms[uri], graph[uri].content) });
        }
        return newGraph;
    }, snapshotItem.snapshot);
    return graphSnapshot;
};
const moveDependencyRecordHistory = (pos, state) => {
    if (!state.history.items.length) {
        return state;
    }
    const newIndex = clamp(state.history.index + pos, 1, state.history.items.length);
    const graphSnapshot = getGraphAtHistoricPoint(state.history.items, newIndex);
    state = updateDependencyGraph(graphSnapshot, state);
    state = refreshModuleInspectorNodes(state);
    state = updateRootState({
        history: Object.assign(Object.assign({}, state.history), { index: newIndex })
    }, state);
    return state;
};
export const isUnsaved = (state) => state.openFiles.some(openFile => Boolean(openFile.newContent));
export const removeBuildScriptProcess = (state) => {
    state = Object.assign(Object.assign({}, state), { scriptProcesses: state.scriptProcesses.filter(process => process.id !== state.buildScriptProcessId), buildScriptProcessId: null });
    return state;
};
const DEFAULT_CANVAS = {
    backgroundColor: "#EEE",
    translate: {
        left: 0,
        top: 0,
        zoom: 1
    }
};
export const confirm = (message, type, state) => updateRootState({ confirm: { message, type } }, state);
export const undo = (root) => moveDependencyRecordHistory(-1, root);
export const redo = (root) => moveDependencyRecordHistory(1, root);
export const getOpenFile = (uri, openFiles) => openFiles.find(openFile => openFile.uri === uri);
export const getOpenFilesWithContent = (state) => state.openFiles.filter(openFile => openFile.newContent);
export const updateOpenFileContent = (uri, newContent, state) => {
    return updateOpenFile({
        temporary: false,
        newContent
    }, uri, state);
};
export const updateProjectScripts = (scripts, state) => {
    // todo - queue file to save
    state = Object.assign(Object.assign({}, state), { projectInfo: Object.assign(Object.assign({}, state.projectInfo), { config: Object.assign(Object.assign({}, state.projectInfo.config), { scripts: Object.assign(Object.assign({}, (state.projectInfo.config.scripts || EMPTY_OBJECT)), scripts) }) }) });
    state = queueSaveProjectFile(state);
    return state;
};
const queueSaveProjectFile = (state) => {
    state = updateOpenFile({
        temporary: false,
        newContent: new Buffer(JSON.stringify(state.projectInfo.config, null, 2))
    }, state.projectInfo.path, state);
    return state;
};
export const getInspectorNodeClipboardData = (state) => {
    return state.selectedInspectorNodes.map(node => {
        return getPCNodeClip(node, state.sourceNodeInspector, state.documents, state.frames, state.graph);
    });
};
export const getActiveEditorWindow = (state) => getEditorWithActiveFileUri(state.activeEditorFilePath, state);
export const updateOpenFile = (properties, uri, state) => {
    const file = getOpenFile(uri, state.openFiles);
    if (!file) {
        state = addOpenFile(uri, false, state);
        return updateOpenFile(properties, uri, state);
    }
    const index = state.openFiles.indexOf(file);
    return updateRootState({
        openFiles: arraySplice(state.openFiles, index, 1, Object.assign(Object.assign({}, file), properties))
    }, state);
};
export const openFile = (uri, temporary, secondaryTab, state) => {
    let file = getOpenFile(uri, state.openFiles);
    state = openEditorFileUri(uri, secondaryTab, state);
    if (!file) {
        state = addOpenFile(uri, temporary, state);
        file = getOpenFile(uri, state.openFiles);
        state = centerEditorCanvasOrLater(state, uri);
    }
    if (!hasFileCacheItem(uri, state)) {
        state = queueOpenFile(uri, state);
    }
    return state;
};
export const refreshModuleInspectorNodes = (state) => {
    const [sourceNodeInspector, sourceNodeInspectorMap] = refreshInspectorTree(state.sourceNodeInspector, state.graph, state.openFiles.map(({ uri }) => uri).filter(Boolean), state.sourceNodeInspectorMap, state.sourceNodeInspectorGraph);
    state = updateRootState({
        sourceNodeInspector,
        sourceNodeInspectorMap,
        sourceNodeInspectorGraph: state.graph,
        selectedInspectorNodes: state.selectedInspectorNodes.filter(node => Boolean(getNestedTreeNodeById(node.id, sourceNodeInspector))),
        hoveringInspectorNodes: state.hoveringInspectorNodes.filter(node => Boolean(getNestedTreeNodeById(node.id, sourceNodeInspector)))
    }, state);
    return state;
};
export const updateSourceInspectorNode = (state, updater) => {
    return updateRootState({
        sourceNodeInspector: updater(state.sourceNodeInspector)
    }, state);
};
export const getEditorWindowWithFileUri = (uri, state) => {
    return state.editorWindows.find(window => window.tabUris.indexOf(uri) !== -1);
};
export const getEditorWithActiveFileUri = (uri, state) => {
    return state.editorWindows.find(editor => editor.activeFilePath === uri);
};
const createEditorWindow = (tabUris, activeFilePath) => ({
    tabUris,
    activeFilePath
});
let scriptProcessCount = 0;
export const createScriptProcess = (label, script) => ({
    label,
    script,
    id: `script${scriptProcessCount++}`,
    logs: []
});
let unloaderCount = 0;
export const createUnloader = () => ({
    id: `script${unloaderCount++}`,
    completed: false
});
export const isUnloaded = (state) => state.readyType === RootReadyType.UNLOADING &&
    !state.unloaders.some(({ completed }) => !completed);
export const getProjectCWD = (state) => state.projectInfo && path.dirname(stripProtocol(state.projectInfo.path));
export const getSyntheticWindowBounds = memoize((uri, state) => {
    const frames = getFramesByDependencyUri(uri, state.frames, state.documents, state.graph);
    if (!window)
        return createZeroBounds();
    return mergeBounds(...(frames || EMPTY_ARRAY).map(frame => frame.bounds));
});
export const isImageMimetype = (mimeType) => /^image\//.test(mimeType);
export const pruneOpenFiles = (state) => {
    const openFiles = state.openFiles.filter(openFile => {
        return !!state.fileCache[openFile.uri];
    });
    const editorWindows = state.editorWindows
        .map(window => {
        const tabUris = window.tabUris.filter(uri => {
            return !!state.fileCache[uri];
        });
        if (!tabUris.length) {
            return null;
        }
        return Object.assign(Object.assign({}, window), { tabUris });
    })
        .filter(Boolean);
    state = updateRootState({
        openFiles,
        editorWindows,
        activeEditorFilePath: null
    }, state);
    state = setNextOpenFile(state);
    return state;
};
export const openEditorFileUri = (uri, secondaryTab, state) => {
    const editor = getEditorWindowWithFileUri(uri, state) ||
        (secondaryTab
            ? state.editorWindows.length > 1
                ? state.editorWindows[1]
                : null
            : state.editorWindows[0]);
    if (secondaryTab &&
        editor === state.editorWindows[0] &&
        (editor.tabUris.length > 1 || state.editorWindows.length > 1)) {
        state = closeEditorWindowUri(uri, state);
        state = openEditorFileUri(uri, true, state);
        return state;
    }
    return Object.assign(Object.assign({}, state), { selectedFileNodeIds: state.selectedFileNodeIds.length === 1 &&
            getNestedTreeNodeById(state.selectedFileNodeIds[0], state.projectDirectory).uri === uri
            ? state.selectedFileNodeIds
            : EMPTY_ARRAY, selectedInspectorNodes: EMPTY_ARRAY, hoveringInspectorNodes: EMPTY_ARRAY, activeEditorFilePath: uri, editorWindows: editor
            ? arraySplice(state.editorWindows, state.editorWindows.indexOf(editor), 1, Object.assign(Object.assign({}, editor), { tabUris: editor.tabUris.indexOf(uri) === -1
                    ? [...editor.tabUris, uri]
                    : editor.tabUris, activeFilePath: uri }))
            : [...state.editorWindows, createEditorWindow([uri], uri)] });
};
export const shiftActiveEditorTab = (delta, state) => {
    const editor = getActiveEditorWindow(state);
    // nothing open
    if (!editor) {
        return state;
    }
    const index = editor.tabUris.indexOf(editor.activeFilePath);
    let newIndex = index + delta;
    if (newIndex < 0) {
        newIndex = editor.tabUris.length + delta;
    }
    else if (newIndex >= editor.tabUris.length) {
        newIndex = -1 + delta;
    }
    newIndex = clamp(newIndex, 0, editor.tabUris.length - 1);
    return openEditorFileUri(editor.tabUris[newIndex], false, state);
};
const removeEditorWindow = ({ activeFilePath }, state) => {
    const editor = getEditorWithActiveFileUri(activeFilePath, state);
    return Object.assign(Object.assign({}, state), { editorWindows: arraySplice(state.editorWindows, state.editorWindows.indexOf(editor), 1) });
};
const closeEditorWindowUri = (uri, state) => {
    const editorWindow = getEditorWindowWithFileUri(uri, state);
    if (editorWindow.tabUris.length === 1) {
        state = removeEditorWindow(editorWindow, state);
    }
    else {
        const index = editorWindow.tabUris.indexOf(uri);
        const tabUris = arraySplice(editorWindow.tabUris, index, 1);
        const nextActiveUri = tabUris[Math.max(0, index - 1)];
        state = updateEditorWindow({
            tabUris,
            activeFilePath: nextActiveUri
        }, uri, state);
        state = updateRootState({ activeEditorFilePath: nextActiveUri }, state);
    }
    return state;
};
export const closeFile = (uri, state) => {
    state = closeEditorWindowUri(uri, state);
    state = updateRootState({
        openFiles: state.openFiles.filter(openFile => openFile.uri !== uri)
    }, state);
    state = setNextOpenFile(state);
    state = refreshModuleInspectorNodes(state);
    return state;
};
export const setNextOpenFile = (state) => {
    const hasOpenFile = state.openFiles.find(openFile => Boolean(getEditorWithActiveFileUri(openFile.uri, state)));
    if (hasOpenFile) {
        return state;
    }
    state = Object.assign(Object.assign({}, state), { hoveringInspectorNodes: EMPTY_ARRAY, selectedInspectorNodes: EMPTY_ARRAY });
    if (state.openFiles.length) {
        state = openEditorFileUri(state.openFiles[0].uri, false, state);
    }
    return state;
};
export const removeTemporaryOpenFiles = (state) => {
    return Object.assign(Object.assign({}, state), { openFiles: state.openFiles.filter(openFile => !openFile.temporary) });
};
export const openSyntheticVisibleNodeOriginFile = (node, state) => {
    let sourceNode = getSyntheticSourceNode(node, state.graph);
    if (isPCComponentInstance(sourceNode)) {
        sourceNode = getPCNode(sourceNode.is, state.graph);
    }
    const uri = getPCNodeDependency(sourceNode.id, state.graph).uri;
    const editors = state.editorWindows;
    const activeEditor = getActiveEditorWindow(state);
    const existingEditor = getEditorWindowWithFileUri(uri, state);
    // if existing editor, then don't open in second tab
    state = openFile(uri, false, activeEditor === editors[1] && !existingEditor, state);
    const instance = findNestedNode(state.sourceNodeInspector, child => {
        return !child.instancePath && child.sourceNodeId === sourceNode.id;
    });
    state = setSelectedInspectorNodes(state, [instance]);
    // state = centerCanvasToSelectedNodes(state);
    return state;
};
export const centerCanvasToSelectedNodes = (state) => {
    state = centerEditorCanvasOrLater(state, state.activeEditorFilePath);
    return state;
};
export const addOpenFile = (uri, temporary, state) => {
    const file = getOpenFile(uri, state.openFiles);
    if (file) {
        return state;
    }
    state = removeTemporaryOpenFiles(state);
    state = Object.assign(Object.assign({}, state), { openFiles: [
            ...state.openFiles,
            {
                uri,
                temporary,
                canvas: DEFAULT_CANVAS
            }
        ] });
    // need to sync inspector nodes so that they show up in the inspector pane
    state = refreshModuleInspectorNodes(state);
    return state;
};
export const upsertPCModuleInspectorNode = (module, state) => { };
export const keepActiveFileOpen = (state) => {
    return Object.assign(Object.assign({}, state), { openFiles: state.openFiles.map(openFile => (Object.assign(Object.assign({}, openFile), { temporary: false }))) });
};
export const setRootStateSyntheticVisibleNodeLabelEditing = (nodeId, value, state) => {
    const node = getSyntheticNodeById(nodeId, state.documents);
    const document = getSyntheticVisibleNodeDocument(node.id, state.documents);
    state = updateSyntheticDocument(updateSyntheticVisibleNodeMetadata({
        [SyntheticVisibleNodeMetadataKeys.EDITING_LABEL]: value
    }, node, document), document, state);
    return state;
};
export const setRootStateFileNodeExpanded = (nodeId, value, state) => {
    return updateRootState({
        projectDirectory: updateNestedNodeTrail(getTreeNodePath(nodeId, state.projectDirectory), state.projectDirectory, (child) => (Object.assign(Object.assign({}, child), { expanded: value })))
    }, state);
};
export const updateEditorWindow = (properties, uri, root) => {
    const window = getEditorWindowWithFileUri(uri, root);
    const i = root.editorWindows.indexOf(window);
    if (i === -1) {
        return root;
    }
    return updateRootState({
        editorWindows: arraySplice(root.editorWindows, i, 1, Object.assign(Object.assign({}, window), properties))
    }, root);
};
const INITIAL_ZOOM_PADDING = 50;
export const centerEditorCanvasOrLater = (state, editorFileUri) => {
    const document = getSyntheticDocumentByDependencyUri(editorFileUri, state.documents, state.graph);
    return document
        ? centerEditorCanvas(state, editorFileUri)
        : Object.assign(Object.assign({}, state), { recenterUriAfterEvaluation: editorFileUri });
};
export const centerEditorCanvas = (state, editorFileUri, innerBounds, smooth = false, zoomOrZoomToFit = true) => {
    if (!innerBounds) {
        const frames = getFramesByDependencyUri(editorFileUri, state.frames, state.documents, state.graph);
        if (!frames.length) {
            return state;
        }
        innerBounds = state.selectedInspectorNodes.length
            ? getSelectionBounds(state.selectedInspectorNodes, state.documents, state.frames, state.graph)
            : getSyntheticWindowBounds(editorFileUri, state);
    }
    // no windows loaded
    if (innerBounds.left +
        innerBounds.right +
        innerBounds.top +
        innerBounds.bottom ===
        0) {
        console.warn(` Cannot center when bounds has no size`);
        return updateOpenFileCanvas({
            translate: { left: 0, top: 0, zoom: 1 }
        }, editorFileUri, state);
    }
    const editorWindow = getEditorWindowWithFileUri(editorFileUri, state);
    const openFile = getOpenFile(editorFileUri, state.openFiles);
    const { container } = editorWindow;
    if (!container) {
        console.warn("cannot center canvas without a container");
        return state;
    }
    const { canvas: { translate } } = openFile;
    const { width, height } = container.getBoundingClientRect();
    const innerSize = getBoundsSize(innerBounds);
    const centered = {
        left: -innerBounds.left + width / 2 - innerSize.width / 2,
        top: -innerBounds.top + height / 2 - innerSize.height / 2
    };
    const scale = typeof zoomOrZoomToFit === "boolean"
        ? Math.min((width - INITIAL_ZOOM_PADDING) / innerSize.width, (height - INITIAL_ZOOM_PADDING) / innerSize.height)
        : typeof zoomOrZoomToFit === "number"
            ? zoomOrZoomToFit
            : translate.zoom;
    state = updateEditorWindow({
        smooth
    }, editorFileUri, state);
    state = updateOpenFileCanvas({
        translate: centerTransformZoom(Object.assign(Object.assign({}, centered), { zoom: 1 }), { left: 0, top: 0, right: width, bottom: height }, Math.min(scale, 1))
    }, editorFileUri, state);
    return state;
};
export const updateOpenFileCanvas = (properties, uri, root) => {
    const openFile = getOpenFile(uri, root.openFiles);
    return updateOpenFile({
        canvas: Object.assign(Object.assign({}, openFile.canvas), properties)
    }, uri, root);
};
// export const setInsertFile = (type: InsertFileType, state: RootState) => {
//   const file = getNestedTreeNodeById(
//     state.selectedFileNodeIds[0] || state.projectDirectory.id,
//     state.projectDirectory
//   );
//   return updateRootState(
//     {
//       insertFileInfo: {
//         type,
//         directoryId: isDirectory(file)
//           ? file.id
//           : getParentTreeNode(file.id, state.projectDirectory).id
//       }
//     },
//     state
//   );
// };
export const setTool = (toolType, root) => {
    if (!root.editorWindows.length) {
        return root;
    }
    root = Object.assign(Object.assign({}, root), { selectedComponentId: null });
    root = updateRootState({ toolType }, root);
    return root;
};
export const getActiveFrames = (root) => values(root.frames).filter(frame => getActiveEditorWindow(root).activeFilePath ===
    getSyntheticDocumentDependencyUri(getSyntheticVisibleNodeDocument(frame.syntheticContentNodeId, root.documents), root.graph));
export const getCanvasTranslate = (canvas) => canvas.translate;
export const getScaledMouseCanvasPosition = (state, point) => {
    const canvas = getOpenFile(state.activeEditorFilePath, state.openFiles)
        .canvas;
    const translate = getCanvasTranslate(canvas);
    const scaledPageX = (point.left - translate.left) / translate.zoom;
    const scaledPageY = (point.top - translate.top) / translate.zoom;
    return { left: scaledPageX, top: scaledPageY };
};
export const getCanvasMouseTargetNodeId = (state, event, filter) => {
    return getCanvasMouseTargetNodeIdFromPoint(state, {
        left: event.pageX,
        top: event.pageY
    }, filter);
};
export const getCanvasMouseTargetInspectorNode = (state, event, filter) => {
    const syntheticNodeId = getCanvasMouseTargetNodeId(state, event.sourceEvent, filter);
    if (!syntheticNodeId) {
        return null;
    }
    const syntheticNode = getSyntheticNodeById(syntheticNodeId, state.documents);
    const assocInspectorNode = getSyntheticInspectorNode(syntheticNode, getSyntheticVisibleNodeDocument(syntheticNode.id, state.documents), state.sourceNodeInspector, state.graph);
    const insertableSourceNode = getInsertableInspectorNode(assocInspectorNode, state.sourceNodeInspector, state.graph);
    return insertableSourceNode;
};
const getSelectedInspectorNodeParentShadowId = (state) => {
    const node = state.selectedInspectorNodes[0];
    if (!node) {
        return null;
    }
    const inspectorNode = getNestedTreeNodeById(node.id, state.sourceNodeInspector);
    const shadow = inspectorNode.name === InspectorTreeNodeName.SHADOW
        ? inspectorNode
        : getInspectorNodeParentShadow(inspectorNode, state.sourceNodeInspector);
    return shadow && shadow.id;
};
const defaultCanvasNodeFilter = ({ id }, state) => {
    const syntheticNode = getSyntheticNodeById(id, state.documents);
    const document = getSyntheticVisibleNodeDocument(id, state.documents);
    const inspectorNode = getSyntheticInspectorNode(syntheticNode, document, state.sourceNodeInspector, state.graph);
    if (!inspectorNode) {
        return false;
    }
    const contentNode = getInspectorContentNodeContainingChild(inspectorNode, state.sourceNodeInspector) || inspectorNode;
    if (inspectorNodeInShadow(inspectorNode, contentNode)) {
        const selectedParentShadowId = getSelectedInspectorNodeParentShadowId(state);
        if (selectedParentShadowId) {
            const selectedShadowInspectorNode = getNestedTreeNodeById(selectedParentShadowId, state.sourceNodeInspector);
            const inspectorParentShadow = getInspectorNodeParentShadow(inspectorNode, state.sourceNodeInspector);
            const inspectorNodeWithinSelectedShadow = containsNestedTreeNodeById(inspectorNode.id, selectedShadowInspectorNode) && selectedShadowInspectorNode.id === inspectorParentShadow.id;
            const selectedShadowWithinInspectorParentShadow = containsNestedTreeNodeById(selectedShadowInspectorNode.id, inspectorParentShadow);
            if (!inspectorNodeWithinSelectedShadow &&
                !selectedShadowWithinInspectorParentShadow) {
                return false;
            }
        }
        else {
            return false;
        }
    }
    return true;
};
export const getCanvasMouseTargetNodeIdFromPoint = (state, point, filter = defaultCanvasNodeFilter) => {
    const scaledMousePos = getScaledMouseCanvasPosition(state, point);
    const frame = getFrameFromPoint(scaledMousePos, state);
    if (!frame)
        return null;
    const contentNode = getSyntheticNodeById(frame.syntheticContentNodeId, state.documents);
    const { left: scaledPageX, top: scaledPageY } = scaledMousePos;
    const mouseX = scaledPageX - frame.bounds.left;
    const mouseY = scaledPageY - frame.bounds.top;
    const computedInfo = frame.computed || {};
    const intersectingBounds = [];
    const intersectingBoundsMap = new Map();
    const mouseFramePoint = { left: mouseX, top: mouseY };
    for (const id in computedInfo) {
        const { bounds } = computedInfo[id];
        const node = getNestedTreeNodeById(id, contentNode);
        // synth nodes may be lagging behind graph
        if (!node) {
            continue;
        }
        if (pointIntersectsBounds(mouseFramePoint, bounds) && filter(node, state)) {
            intersectingBounds.unshift(bounds);
            intersectingBoundsMap.set(bounds, id);
        }
    }
    if (!intersectingBounds.length)
        return null;
    const smallestBounds = getSmallestBounds(...intersectingBounds);
    return intersectingBoundsMap.get(smallestBounds);
};
export const getCanvasMouseFrame = (state, event) => {
    return getFrameFromPoint(getScaledMouseCanvasPosition(state, {
        left: event.sourceEvent.pageX,
        top: event.sourceEvent.pageY
    }), state);
};
export const getFrameFromPoint = (point, state) => {
    const activeFrames = getActiveFrames(state);
    if (!activeFrames.length)
        return null;
    for (let j = activeFrames.length; j--;) {
        const frame = activeFrames[j];
        if (pointIntersectsBounds(point, frame.bounds)) {
            return frame;
        }
    }
};
export const setSelectedInspectorNodes = (root, selection = EMPTY_ARRAY) => {
    root = updateRootState({
        selectedInspectorNodes: selection
    }, root);
    root = expandedSelectedInspectorNode(root);
    return root;
};
const expandedSelectedInspectorNode = (state) => {
    return state.selectedInspectorNodes.reduce((state, node) => {
        state = updateSourceInspectorNode(state, sourceNodeInspector => expandInspectorNodeById(node.id, sourceNodeInspector));
        return state;
    }, state);
};
export const setSelectedFileNodeIds = (root, ...selectionIds) => {
    const nodeIds = uniq([...selectionIds]);
    root = nodeIds.reduce((state, nodeId) => setRootStateFileNodeExpanded(nodeId, true, root), root);
    root = updateRootState({
        selectedFileNodeIds: nodeIds
    }, root);
    return root;
};
export const setHoveringSyntheticVisibleNodeIds = (root, selectionIds) => {
    const hoveringSyntheticNodeIds = uniq([...selectionIds].filter(nodeId => {
        const node = getSyntheticNodeById(nodeId, root.documents);
        if (!node) {
            console.warn(`node ${nodeId} does not exist`);
        }
        return Boolean(node);
    }));
    return updateRootState({
        hoveringInspectorNodes: hoveringSyntheticNodeIds
            .map(nodeId => {
            const inspectorNode = getSyntheticInspectorNode(getSyntheticNodeById(nodeId, root.documents), getSyntheticVisibleNodeDocument(nodeId, root.documents), root.sourceNodeInspector, root.graph);
            return inspectorNode;
        })
            .filter(Boolean)
    }, root);
};
export const setHoveringInspectorNodes = (root, hoveringInspectorNodes) => {
    return updateRootState({
        hoveringInspectorNodes
    }, root);
};
export const getBoundedSelection = memoize((selectedInspectorNodes, documents, frames, graph) => {
    return selectedInspectorNodes.filter(node => {
        const syntheticNode = getInspectorSyntheticNode(node, documents);
        return (syntheticNode &&
            getSyntheticVisibleNodeRelativeBounds(syntheticNode, frames, graph));
    });
});
export const getSelectionBounds = memoize((selectedInspectorNodes, documents, frames, graph) => mergeBounds(...getBoundedSelection(selectedInspectorNodes, documents, frames, graph).map(node => getSyntheticVisibleNodeRelativeBounds(getInspectorSyntheticNode(node, documents), frames, graph))));
export const isSelectionMovable = memoize((selectedInspectorNodes, rootInspectorNode, graph) => {
    return selectedInspectorNodes.every(node => {
        return getInspectorContentNode(node, rootInspectorNode).id === node.id;
    });
});
export const isSelectionResizable = memoize((selectedSyntheticNodes, rootInspectorNode, graph) => {
    return selectedSyntheticNodes.every(node => {
        return getInspectorContentNode(node, rootInspectorNode).id === node.id;
    });
});
//# sourceMappingURL=index.js.map