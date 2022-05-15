import * as path from "path";
import {
  arraySplice,
  Directory,
  memoize,
  EMPTY_ARRAY,
  Point,
  Translate,
  Bounds,
  pointIntersectsBounds,
  getSmallestBounds,
  mergeBounds,
  getNestedTreeNodeById,
  stripProtocol,
  getParentTreeNode,
  TreeNode,
  getBoundsSize,
  centerTransformZoom,
  createZeroBounds,
  FSItem,
  getTreeNodePath,
  KeyValue,
  updateNestedNodeTrail,
  getTreeNodeFromPath,
  EMPTY_OBJECT,
  TreeNodeUpdater,
  findNestedNode,
  findTreeNodeParent,
  containsNestedTreeNodeById,
  updateProperties,
  addProtocol,
  FILE_PROTOCOL,
  boundsToSize,
} from "tandem-common";
import {
  SyntheticVisibleNode,
  PCEditorState,
  getSyntheticSourceNode,
  getPCNodeDependency,
  getSyntheticNodeById,
  getSyntheticVisibleNodeDocument,
  Frame,
  getSyntheticDocumentDependencyUri,
  getSyntheticVisibleNodeRelativeBounds,
  updateDependencyGraph,
  updateSyntheticVisibleNodeMetadata,
  diffTreeNode,
  TreeNodeOperationalTransformType,
  PCSourceTagNames,
  patchTreeNode,
  SyntheticDocument,
  updateSyntheticDocument,
  getFramesByDependencyUri,
  PCVisibleNode,
  PCVariant,
  TreeNodeOperationalTransform,
  getPCNode,
  isPCComponentInstance,
  PCComponent,
  PCModule,
  SyntheticNode,
  PCNode,
  getPCNodeModule,
  getSyntheticInstancePath,
  syntheticNodeIsInShadow,
  PCComponentInstanceElement,
  isSlot,
  Dependency,
  DependencyGraph,
  getModifiedDependencies,
  PCConfig,
  inspectorNodeInShadow,
  getInspectorContentNodeContainingChild,
  getInspectorNodeParentShadow,
  InspectorTreeNodeName,
  expandInspectorNodeById,
  getInspectorContentNode,
  getInspectorSyntheticNode,
  getSyntheticDocumentByDependencyUri,
  getPCNodeClip,
  createRootInspectorNode,
} from "paperclip";
import {
  CanvasToolOverlayMouseMoved,
  CanvasToolOverlayClicked,
  CanvasDroppedItem,
} from "../actions";
import { uniq, values, clamp, last } from "lodash";
import { FSSandboxRootState, queueOpenFile, hasFileCacheItem } from "fsbox";
import {
  refreshInspectorTree,
  InspectorTreeBaseNode,
  getSyntheticInspectorNode,
  InspectorNode,
  getInsertableInspectorNode,
} from "paperclip";
import { ContextMenuItem } from "../components/context-menu/view.pc";
import { Action } from "redux";

export enum ToolType {
  TEXT,
  POINTER,
  COMPONENT,
  ELEMENT,
}

export type ProjectOptions = {
  allowCascadeFonts?: boolean;
};

export type ProjectScripts = {
  previewServer?: string;
  build?: string;
  openApp?: string;
};

export type ProjectConfig = {
  scripts?: ProjectScripts;

  // relative path to main file
  mainFilePath?: string;

  // path to PC file where all global data is stored
  globalFilePath?: string;

  options?: ProjectOptions;
} & PCConfig;

export type ProjectInfo = {
  config: ProjectConfig;
  path: string;
};

export enum FrameMode {
  PREVIEW = "preview",
  DESIGN = "design",
}

export const REGISTERED_COMPONENT = "REGISTERED_COMPONENT";
export const SNAPSHOT_GAP = 50;

export enum SyntheticVisibleNodeMetadataKeys {
  EDITING_LABEL = "editingLabel",
}

export type ScriptProcessLog = {
  error: boolean;
  text: string;
};

export type ScriptProcess = {
  id: string;
  script: string;
  logs: ScriptProcessLog[];
  label: string;
};

export type RegisteredComponent = {
  uri?: string;
  tagName: string;
  template: TreeNode<any>;
};

export type Canvas = {
  backgroundColor: string;
  panning?: boolean;
  translate: Translate;
};

export type GraphHistoryItem = {
  snapshot?: DependencyGraph;
  transforms?: KeyValue<TreeNodeOperationalTransform[]>;
};

export type GraphHistory = {
  index: number;
  items: GraphHistoryItem[];
};

export type Editor = {
  canvas: Canvas;
};

export type EditorWindow = {
  tabUris: string[];
  activeFilePath?: string;
  mousePosition?: Point;
  movingOrResizing?: boolean;
  smooth?: boolean;
  secondarySelection?: boolean;
  fullScreen?: boolean;

  // TODO - this needs to be the virtual element instead of the actual DOM
  canvasBounds?: Bounds;
};

export enum ConfirmType {
  ERROR,
  WARNING,
  SUCCESS,
}

export type Confirm = {
  type: ConfirmType;
  message: string;
};

export type Prompt = {
  label: string;
  defaultValue?: string;
  okActionType: string;
};

export type FontFamily = {
  name: string;
};

export enum QuickSearchResultType {
  URI = "uri",
  COMPONENT = "component",
}

export const IS_WINDOWS =
  typeof navigator != null ? navigator.appVersion.indexOf("Win") !== -1 : false;
export const IS_MAC_OS =
  typeof navigator != null ? navigator.appVersion.indexOf("Mac") !== -1 : false;

export type BaseQuickSearchResult<TType extends QuickSearchResultType> = {
  label: string;
  description: string;
  type: TType;
};

export enum ContextMenuOptionType {
  GROUP = "group",
  ITEM = "item",
}

export type ContextMenuItem = {
  type: ContextMenuOptionType.ITEM;
  label: string;
  action: Action;
  keyCombo?: string;
};

export type ContextMenuGroup = {
  type: ContextMenuOptionType.GROUP;
  options: ContextMenuItem[];
};

export type ContextMenuOption = ContextMenuGroup | ContextMenuItem;

export type QuickSearchUriResult = {
  uri: string;
} & BaseQuickSearchResult<QuickSearchResultType.URI>;

export type QuickSearchComponentResult = {
  componentId: string;
} & BaseQuickSearchResult<QuickSearchResultType.COMPONENT>;

export type QuickSearchResult =
  | QuickSearchUriResult
  | QuickSearchComponentResult;

export type QuickSearch = {
  filter: string;

  // TODO - will eventually need to interface things like components
  matches: QuickSearchResult[];
};

export enum EditMode {
  PRIMARY,
  SECONDARY,
}

export enum RootReadyType {
  LOADING,
  LOADED,
  UNLOADING,
}

export enum AddFileType {
  BLANK,
  COMPONENT,
  DIRECTORY,
}

export type NewFSItemInfo = {
  fileType: AddFileType;
  directory: Directory;
};

export type Unloader = {
  id: string;
  completed: boolean;
};

export type RootState = {
  editorWindows: EditorWindow[];
  openFiles: OpenFile[];
  toolType?: ToolType;
  activeEditorFilePath?: string;
  quickSearch?: QuickSearch;
  editMode: EditMode;
  showConfigureBuildModal?: boolean;
  scriptProcesses: ScriptProcess[];
  unloaders: Unloader[];

  buildScriptProcessId?: string;

  // defined by context menu
  editingBasenameUri?: string;
  confirm?: Confirm;
  prompt?: Prompt;
  selectedDirectoryPath?: string;
  prevGraph?: DependencyGraph;
  showSidebar?: boolean;
  showBottomGutter?: boolean;
  customChrome: boolean;
  renameInspectorNodeId?: string;
  addNewFileInfo?: NewFSItemInfo;

  // TODO - may need to be moved to EditorWindow
  selectedVariant?: PCVariant;

  recenterUriAfterEvaluation?: string;
  openedMain?: boolean;

  // seaprate from synthetic & AST since it represents both. May also have separate
  // tooling
  selectedInspectorNodes: InspectorNode[];
  hoveringInspectorNodes: InspectorNode[];
  fontFamilies?: FontFamily[];
  sourceNodeInspector: InspectorTreeBaseNode<any>;
  sourceNodeInspectorMap: KeyValue<string[]>;

  // used for syncing
  sourceNodeInspectorGraph?: DependencyGraph;

  // TODO - should be ref
  selectedFileNodeIds: string[];
  selectedComponentVariantName?: string;
  readyType?: RootReadyType;
  projectDirectory?: Directory;
  projectInfo?: ProjectInfo;
  history: GraphHistory;
  showQuickSearch?: boolean;
  selectedComponentId?: string;
  queuedDndInfo?: CanvasDroppedItem;
} & PCEditorState &
  FSSandboxRootState;

export const INITIAL_STATE: RootState = {
  editorWindows: [],
  customChrome: false,
  selectedInspectorNodes: [],
  fontFamilies: [],
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
    items: [],
  },
  openFiles: [],
  frames: [],
  documents: [],
  graph: {},
  fileCache: {},
  selectedComponentId: null,
};

// TODO - change this to Editor
export type OpenFile = {
  temporary: boolean;
  newContent?: Buffer;
  uri: string;
  canvas: Canvas;
};

export const updateRootState = <TState extends RootState>(
  properties: Partial<TState>,
  root: TState
): TState => updateProperties(properties, root);

export const deselectRootProjectFiles = (state: RootState) =>
  updateRootState(
    {
      selectedFileNodeIds: [],
    },
    state
  );

export const persistRootState = (
  persistPaperclipState: (state: RootState) => RootState,
  state: RootState
) => {
  const oldGraph = state.prevGraph || state.graph;
  state = updateRootState(persistPaperclipState(state), state);

  state = keepActiveFileOpen(state);

  const modifiedDeps = getModifiedDependencies(state.graph, oldGraph);
  state = addHistory(oldGraph, state.graph, state);

  state = modifiedDeps.reduce(
    (state, dep: Dependency<any>) => setOpenFileContent(dep, state),
    state
  );

  state = refreshModuleInspectorNodes(state);
  return state;
};

const getUpdatedInspectorNodes = (
  newState: RootState,
  oldState: RootState,
  scope: InspectorNode
) => {
  const MAX_DEPTH = 1;
  const oldScope: InspectorNode = getNestedTreeNodeById(
    scope.id,
    oldState.sourceNodeInspector
  );
  const newScope: InspectorNode = getNestedTreeNodeById(
    scope.id,
    newState.sourceNodeInspector
  );

  let newInspectorNodes: InspectorNode[] = [];
  let model = oldScope;
  diffTreeNode(oldScope, newScope).forEach((ot) => {
    const target = getTreeNodeFromPath(ot.nodePath, model);
    model = patchTreeNode([ot], model);

    if (ot.nodePath.length > MAX_DEPTH) {
      return;
    }

    // TODO - will need to check if new parent is not in an instance of a component.
    // Will also need to consider child overrides though.
    if (ot.type === TreeNodeOperationalTransformType.INSERT_CHILD) {
      newInspectorNodes.push(ot.child as InspectorNode);
    } else if (
      ot.type === TreeNodeOperationalTransformType.SET_PROPERTY &&
      ot.name === "source"
    ) {
      newInspectorNodes.push(target);
    }
  });

  // ensure that content nodes are not selected.
  newInspectorNodes = newInspectorNodes.map((node) => {
    return node.name === InspectorTreeNodeName.CONTENT
      ? node.children[0]
      : node;
  });

  return uniq(newInspectorNodes);
};

export const selectInsertedSyntheticVisibleNodes = (
  oldState: RootState,
  newState: RootState,
  scope: InspectorNode,
  onlyOne: boolean = true
) => {
  let insertedNodes = getUpdatedInspectorNodes(newState, oldState, scope);

  if (onlyOne && insertedNodes.length) {
    insertedNodes = [last(insertedNodes)];
  }

  return setSelectedInspectorNodes(newState, insertedNodes);
};

export const getInsertableSourceNodeFromSyntheticNode = memoize(
  (
    node: SyntheticVisibleNode,
    document: SyntheticDocument,
    graph: DependencyGraph
  ) => {
    const sourceNode = getSyntheticSourceNode(node, graph);

    if (syntheticNodeIsInShadow(node, document, graph)) {
      const module = getPCNodeModule(sourceNode.id, graph);
      const instancePath = getSyntheticInstancePath(node, document, graph);
      const instancePCComponent = getPCNode(
        (getPCNode(instancePath[0], graph) as PCComponentInstanceElement).is,
        graph
      );
      const slot = findTreeNodeParent(sourceNode.id, module, (parent: PCNode) =>
        isSlot(parent)
      );

      return slot && containsNestedTreeNodeById(slot.id, instancePCComponent)
        ? slot
        : null;
    } else if (
      sourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE &&
      sourceNode.name !== PCSourceTagNames.TEXT
    ) {
      return sourceNode;
    }

    return null;
  }
);

export const getInsertableSourceNodeScope = memoize(
  (
    insertableSourceNode: PCNode,
    relative: SyntheticVisibleNode,
    rootInspectorNode: InspectorNode,
    document: SyntheticDocument,
    graph: DependencyGraph
  ): InspectorNode => {
    const containsSource = (current: SyntheticVisibleNode) => {
      const sourceNode = getSyntheticSourceNode(current, graph);
      return containsNestedTreeNodeById(insertableSourceNode.id, sourceNode);
    };

    if (containsSource(relative)) {
      return getSyntheticInspectorNode(
        relative,
        document,
        rootInspectorNode,
        graph
      );
    }

    return getSyntheticInspectorNode(
      findTreeNodeParent(
        relative.id,
        document,
        containsSource
      ) as SyntheticNode,
      document,
      rootInspectorNode,
      graph
    );
  }
);

export const teeHistory = (state: RootState) => {
  if (state.prevGraph) {
    return state;
  }
  return {
    ...state,
    prevGraph: state.graph,
  };
};

export const getBuildScriptProcess = (state: RootState) =>
  state.scriptProcesses.find(
    (process) => process.id === state.buildScriptProcessId
  );

export const getSyntheticRelativesOfParentSource = memoize(
  (
    node: SyntheticVisibleNode,
    parentSourceNode: PCNode,
    documents: SyntheticDocument[],
    graph: DependencyGraph
  ) => {
    const document = getSyntheticVisibleNodeDocument(node.id, documents);
    const module = getPCNodeModule(parentSourceNode.id, graph);

    const relatedParent = findTreeNodeParent(
      node.id,
      document,
      (parent: SyntheticNode) => {
        const sourceNode = getSyntheticSourceNode(parent, graph);
        return (
          getParentTreeNode(sourceNode.id, module).id === parentSourceNode.id
        );
      }
    );
    const relatedParentParent = getParentTreeNode(relatedParent.id, document);
    return relatedParentParent.children.filter((child: SyntheticNode) => {
      const sourceNode = getSyntheticSourceNode(child, graph);
      return (
        getParentTreeNode(sourceNode.id, module).id === parentSourceNode.id
      );
    }) as SyntheticVisibleNode[];
  }
);

const setOpenFileContent = (dep: Dependency<any>, state: RootState) =>
  updateOpenFile(
    {
      temporary: false,
      newContent: new Buffer(JSON.stringify(dep.content, null, 2), "utf8"),
    },
    dep.uri,
    state
  );

const addHistory = (
  oldGraph: DependencyGraph,
  newGraph: DependencyGraph,
  state: RootState
) => {
  const items = state.history.items.slice(0, state.history.index);

  const prevSnapshotItem: GraphHistoryItem = getNextHistorySnapshot(items);

  if (
    !items.length ||
    (prevSnapshotItem &&
      items.length - items.indexOf(prevSnapshotItem) > SNAPSHOT_GAP)
  ) {
    items.push({
      snapshot: oldGraph,
    });
  }

  const currentGraph = getGraphAtHistoricPoint(items);

  const modifiedDeps = getModifiedDependencies(newGraph, currentGraph);
  const transforms = {};
  for (const dep of modifiedDeps) {
    transforms[dep.uri] = diffTreeNode(
      currentGraph[dep.uri].content,
      dep.content,
      EMPTY_OBJECT
    );
  }

  return updateRootState(
    {
      prevGraph: null,
      history: {
        index: items.length + 1,
        items: [
          ...items,
          {
            transforms,
          },
        ],
      },
    },
    state
  );
};

export const getGlobalFileUri = (info: ProjectInfo) => {
  const globalRelativeFilePath =
    (info && info.config.globalFilePath) || info.config.mainFilePath;
  return (
    globalRelativeFilePath &&
    addProtocol(
      FILE_PROTOCOL,
      path.join(path.dirname(info.path), globalRelativeFilePath)
    )
  );
};

const getNextHistorySnapshot = (items: GraphHistoryItem[]) => {
  for (let i = items.length; i--; ) {
    const prevHistoryItem = items[i];
    if (prevHistoryItem.snapshot) {
      return items[i];
    }
  }
};

const getGraphAtHistoricPoint = (
  allItems: GraphHistoryItem[],
  index: number = allItems.length
) => {
  const items = allItems.slice(0, index);
  const snapshotItem = getNextHistorySnapshot(items);
  const snapshotIndex = items.indexOf(snapshotItem);
  const transformItems = items.slice(snapshotIndex + 1);

  const graphSnapshot = transformItems.reduce((graph, { transforms }) => {
    const newGraph = { ...graph };
    for (const uri in transforms) {
      newGraph[uri] = {
        ...newGraph[uri],
        content: patchTreeNode(transforms[uri], graph[uri].content),
      };
    }
    return newGraph;
  }, snapshotItem.snapshot) as DependencyGraph;

  return graphSnapshot;
};

const moveDependencyRecordHistory = (
  pos: number,
  state: RootState
): RootState => {
  if (!state.history.items.length) {
    return state;
  }
  const newIndex = clamp(
    state.history.index + pos,
    1,
    state.history.items.length
  );

  const graphSnapshot = getGraphAtHistoricPoint(state.history.items, newIndex);

  state = updateDependencyGraph(graphSnapshot, state);
  state = refreshModuleInspectorNodes(state);

  state = updateRootState(
    {
      history: {
        ...state.history,
        index: newIndex,
      },
    },
    state
  );

  return state;
};

export const isUnsaved = (state: RootState) =>
  state.openFiles.some((openFile) => Boolean(openFile.newContent));

export const removeBuildScriptProcess = (state: RootState) => {
  state = {
    ...state,
    scriptProcesses: state.scriptProcesses.filter(
      (process) => process.id !== state.buildScriptProcessId
    ),
    buildScriptProcessId: null,
  };

  return state;
};
const DEFAULT_CANVAS: Canvas = {
  backgroundColor: "#EEE",
  translate: {
    left: 0,
    top: 0,
    zoom: 1,
  },
};

export const confirm = (message: string, type: ConfirmType, state: RootState) =>
  updateRootState({ confirm: { message, type } }, state);

export const undo = (root: RootState) => moveDependencyRecordHistory(-1, root);
export const redo = (root: RootState) => moveDependencyRecordHistory(1, root);

export const getOpenFile = (uri: string, openFiles: OpenFile[]) =>
  openFiles.find((openFile) => openFile.uri === uri);

export const getOpenFilesWithContent = (state: RootState) =>
  state.openFiles.filter((openFile) => openFile.newContent);

export const updateOpenFileContent = (
  uri: string,
  newContent: Buffer,
  state: RootState
) => {
  return updateOpenFile(
    {
      temporary: false,
      newContent,
    },
    uri,
    state
  );
};

export const updateProjectScripts = (
  scripts: Partial<ProjectScripts>,
  state: RootState
) => {
  // todo - queue file to save
  state = {
    ...state,
    projectInfo: {
      ...state.projectInfo,
      config: {
        ...state.projectInfo.config,
        scripts: {
          ...(state.projectInfo.config.scripts || EMPTY_OBJECT),
          ...scripts,
        },
      },
    },
  };

  state = queueSaveProjectFile(state);

  return state;
};

const queueSaveProjectFile = (state: RootState) => {
  state = updateOpenFile(
    {
      temporary: false,
      newContent: new Buffer(JSON.stringify(state.projectInfo.config, null, 2)),
    },
    state.projectInfo.path,
    state
  );
  return state;
};

export const getInspectorNodeClipboardData = (state: RootState) => {
  return state.selectedInspectorNodes.map((node) => {
    return getPCNodeClip(
      node,
      state.sourceNodeInspector,
      state.documents,
      state.frames,
      state.graph
    );
  });
};

export const getActiveEditorWindow = (state: RootState) =>
  getEditorWithActiveFileUri(state.activeEditorFilePath, state);

export const updateOpenFile = (
  properties: Partial<OpenFile>,
  uri: string,
  state: RootState
) => {
  const file = getOpenFile(uri, state.openFiles);

  if (!file) {
    state = addOpenFile(uri, false, state);
    return updateOpenFile(properties, uri, state);
  }

  const index = state.openFiles.indexOf(file);
  return updateRootState(
    {
      openFiles: arraySplice(state.openFiles, index, 1, {
        ...file,
        ...properties,
      }),
    },
    state
  );
};

export const openFile = (
  uri: string,
  temporary: boolean,
  secondaryTab: boolean,
  state: RootState
): RootState => {
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

export const refreshModuleInspectorNodes = (state: RootState) => {
  const [sourceNodeInspector, sourceNodeInspectorMap] = refreshInspectorTree(
    state.sourceNodeInspector,
    state.graph,
    state.openFiles.map(({ uri }) => uri).filter(Boolean),
    state.sourceNodeInspectorMap,
    state.sourceNodeInspectorGraph
  );

  state = updateRootState(
    {
      sourceNodeInspector,
      sourceNodeInspectorMap,
      sourceNodeInspectorGraph: state.graph,
      selectedInspectorNodes: state.selectedInspectorNodes.filter((node) =>
        Boolean(getNestedTreeNodeById(node.id, sourceNodeInspector))
      ),
      hoveringInspectorNodes: state.hoveringInspectorNodes.filter((node) =>
        Boolean(getNestedTreeNodeById(node.id, sourceNodeInspector))
      ),
    },
    state
  );

  return state;
};

export const updateSourceInspectorNode = (
  state: RootState,
  updater: TreeNodeUpdater<any>
) => {
  return updateRootState(
    {
      sourceNodeInspector: updater(state.sourceNodeInspector),
    },
    state
  );
};

export const getEditorWindowWithFileUri = (
  uri: string,
  state: RootState
): EditorWindow => {
  return state.editorWindows.find(
    (window) => window.tabUris.indexOf(uri) !== -1
  );
};

export const getEditorWithActiveFileUri = (
  uri: string,
  state: RootState
): EditorWindow => {
  return state.editorWindows.find((editor) => editor.activeFilePath === uri);
};

const createEditorWindow = (
  tabUris: string[],
  activeFilePath: string
): EditorWindow => ({
  tabUris,
  activeFilePath,
});

let scriptProcessCount = 0;

export const createScriptProcess = (
  label: string,
  script: string
): ScriptProcess => ({
  label,
  script,
  id: `script${scriptProcessCount++}`,
  logs: [],
});

let unloaderCount = 0;

export const createUnloader = (): Unloader => ({
  id: `script${unloaderCount++}`,
  completed: false,
});

export const isUnloaded = (state: RootState) =>
  state.readyType === RootReadyType.UNLOADING &&
  !state.unloaders.some(({ completed }) => !completed);

export const getProjectCWD = (state: RootState) =>
  state.projectInfo && path.dirname(stripProtocol(state.projectInfo.path));

export const getSyntheticWindowBounds = memoize(
  (uri: string, state: RootState) => {
    const frames = getFramesByDependencyUri(
      uri,
      state.frames,
      state.documents,
      state.graph
    );
    if (!window) return createZeroBounds();
    return mergeBounds(...(frames || EMPTY_ARRAY).map((frame) => frame.bounds));
  }
);

export const isImageMimetype = (mimeType: string) => /^image\//.test(mimeType);
export const pruneOpenFiles = (state: RootState) => {
  const openFiles = state.openFiles.filter((openFile) => {
    return !!state.fileCache[openFile.uri];
  });

  const editorWindows = state.editorWindows
    .map((window) => {
      const tabUris = window.tabUris.filter((uri) => {
        return !!state.fileCache[uri];
      });

      if (!tabUris.length) {
        return null;
      }
      return {
        ...window,
        tabUris,
      };
    })
    .filter(Boolean);

  state = updateRootState(
    {
      openFiles,
      editorWindows,
      activeEditorFilePath: null,
    },
    state
  );

  state = setNextOpenFile(state);

  return state;
};

export const openEditorFileUri = (
  uri: string,
  secondaryTab: boolean,
  state: RootState
): RootState => {
  const editor =
    getEditorWindowWithFileUri(uri, state) ||
    (secondaryTab
      ? state.editorWindows.length > 1
        ? state.editorWindows[1]
        : null
      : state.editorWindows[0]);

  if (
    secondaryTab &&
    editor === state.editorWindows[0] &&
    (editor.tabUris.length > 1 || state.editorWindows.length > 1)
  ) {
    state = closeEditorWindowUri(uri, state);
    state = openEditorFileUri(uri, true, state);
    return state;
  }

  return {
    ...state,
    selectedFileNodeIds:
      state.selectedFileNodeIds.length === 1 &&
      (
        getNestedTreeNodeById(
          state.selectedFileNodeIds[0],
          state.projectDirectory
        ) as FSItem
      ).uri === uri
        ? state.selectedFileNodeIds
        : EMPTY_ARRAY,
    selectedInspectorNodes: EMPTY_ARRAY,
    hoveringInspectorNodes: EMPTY_ARRAY,
    activeEditorFilePath: uri,
    editorWindows: editor
      ? arraySplice(
          state.editorWindows,
          state.editorWindows.indexOf(editor),
          1,
          {
            ...editor,
            tabUris:
              editor.tabUris.indexOf(uri) === -1
                ? [...editor.tabUris, uri]
                : editor.tabUris,
            activeFilePath: uri,
          }
        )
      : [...state.editorWindows, createEditorWindow([uri], uri)],
  };
};

export const shiftActiveEditorTab = (
  delta: number,
  state: RootState
): RootState => {
  const editor = getActiveEditorWindow(state);

  // nothing open
  if (!editor) {
    return state;
  }
  const index = editor.tabUris.indexOf(editor.activeFilePath);
  let newIndex = index + delta;
  if (newIndex < 0) {
    newIndex = editor.tabUris.length + delta;
  } else if (newIndex >= editor.tabUris.length) {
    newIndex = -1 + delta;
  }
  newIndex = clamp(newIndex, 0, editor.tabUris.length - 1);

  return openEditorFileUri(editor.tabUris[newIndex], false, state);
};

const removeEditorWindow = (
  { activeFilePath }: EditorWindow,
  state: RootState
): RootState => {
  const editor = getEditorWithActiveFileUri(activeFilePath, state);
  return {
    ...state,
    editorWindows: arraySplice(
      state.editorWindows,
      state.editorWindows.indexOf(editor),
      1
    ),
  };
};

const closeEditorWindowUri = (uri: string, state: RootState): RootState => {
  const editorWindow = getEditorWindowWithFileUri(uri, state);
  if (editorWindow.tabUris.length === 1) {
    state = removeEditorWindow(editorWindow, state);
  } else {
    const index = editorWindow.tabUris.indexOf(uri);
    const tabUris = arraySplice(editorWindow.tabUris, index, 1);
    const nextActiveUri = tabUris[Math.max(0, index - 1)];
    state = updateEditorWindow(
      {
        tabUris,
        activeFilePath: nextActiveUri,
      },
      uri,
      state
    );

    state = updateRootState({ activeEditorFilePath: nextActiveUri }, state);
  }
  return state;
};

export const closeFile = (uri: string, state: RootState): RootState => {
  state = closeEditorWindowUri(uri, state);

  state = updateRootState(
    {
      openFiles: state.openFiles.filter((openFile) => openFile.uri !== uri),
    },
    state
  );

  state = setNextOpenFile(state);
  state = refreshModuleInspectorNodes(state);

  return state;
};

export const setNextOpenFile = (state: RootState): RootState => {
  const hasOpenFile = state.openFiles.find((openFile) =>
    Boolean(getEditorWithActiveFileUri(openFile.uri, state))
  );

  if (hasOpenFile) {
    return state;
  }
  state = {
    ...state,
    hoveringInspectorNodes: EMPTY_ARRAY,
    selectedInspectorNodes: EMPTY_ARRAY,
  };

  if (state.openFiles.length) {
    state = openEditorFileUri(state.openFiles[0].uri, false, state);
  }

  return state;
};

export const removeTemporaryOpenFiles = (state: RootState) => {
  return {
    ...state,
    openFiles: state.openFiles.filter((openFile) => !openFile.temporary),
  };
};

export const openSyntheticVisibleNodeOriginFile = (
  node: SyntheticVisibleNode,
  state: RootState
) => {
  let sourceNode = getSyntheticSourceNode(
    node as SyntheticVisibleNode,
    state.graph
  ) as PCVisibleNode | PCComponent;

  if (isPCComponentInstance(sourceNode)) {
    sourceNode = getPCNode(sourceNode.is, state.graph) as PCComponent;
  }

  const uri = getPCNodeDependency(sourceNode.id, state.graph).uri;
  const editors = state.editorWindows;
  const activeEditor = getActiveEditorWindow(state);
  const existingEditor = getEditorWindowWithFileUri(uri, state);

  // if existing editor, then don't open in second tab
  state = openFile(
    uri,
    false,
    activeEditor === editors[1] && !existingEditor,
    state
  );
  const instance = findNestedNode(state.sourceNodeInspector, (child) => {
    return !child.instancePath && child.sourceNodeId === sourceNode.id;
  });
  state = setSelectedInspectorNodes(state, [instance]);
  // state = centerCanvasToSelectedNodes(state);
  return state;
};

export const centerCanvasToSelectedNodes = (state: RootState) => {
  state = centerEditorCanvasOrLater(state, state.activeEditorFilePath);
  return state;
};

export const addOpenFile = (
  uri: string,
  temporary: boolean,
  state: RootState
): RootState => {
  const file = getOpenFile(uri, state.openFiles);
  if (file) {
    return state;
  }

  state = removeTemporaryOpenFiles(state);

  state = {
    ...state,
    openFiles: [
      ...state.openFiles,
      {
        uri,
        temporary,
        canvas: DEFAULT_CANVAS,
      },
    ],
  };

  // need to sync inspector nodes so that they show up in the inspector pane
  state = refreshModuleInspectorNodes(state);

  return state;
};

export const upsertPCModuleInspectorNode = (
  module: PCModule,
  state: RootState
) => {};

export const keepActiveFileOpen = (state: RootState): RootState => {
  return {
    ...state,
    openFiles: state.openFiles.map((openFile) => ({
      ...openFile,
      temporary: false,
    })),
  };
};

export const setRootStateSyntheticVisibleNodeLabelEditing = (
  nodeId: string,
  value: boolean,
  state: RootState
) => {
  const node = getSyntheticNodeById(nodeId, state.documents);
  const document = getSyntheticVisibleNodeDocument(node.id, state.documents);
  state = updateSyntheticDocument(
    updateSyntheticVisibleNodeMetadata(
      {
        [SyntheticVisibleNodeMetadataKeys.EDITING_LABEL]: value,
      },
      node,
      document
    ),
    document,
    state
  );
  return state;
};

export const setRootStateFileNodeExpanded = (
  nodeId: string,
  value: boolean,
  state: RootState
) => {
  return updateRootState(
    {
      projectDirectory: updateNestedNodeTrail(
        getTreeNodePath(nodeId, state.projectDirectory),
        state.projectDirectory,
        (child: FSItem) => ({
          ...child,
          expanded: value,
        })
      ),
    },
    state
  );
};

export const updateEditorWindow = (
  properties: Partial<EditorWindow>,
  uri: string,
  root: RootState
) => {
  const window = getEditorWindowWithFileUri(uri, root);
  const i = root.editorWindows.indexOf(window);
  if (i === -1) {
    return root;
  }
  return updateRootState(
    {
      editorWindows: arraySplice(root.editorWindows, i, 1, {
        ...window,
        ...properties,
      }),
    },
    root
  );
};

const INITIAL_ZOOM_PADDING = 50;

export const centerEditorCanvasOrLater = (
  state: RootState,
  editorFileUri: string
): RootState => {
  const document = getSyntheticDocumentByDependencyUri(
    editorFileUri,
    state.documents,
    state.graph
  );
  return document
    ? centerEditorCanvas(state, editorFileUri)
    : {
        ...state,
        recenterUriAfterEvaluation: editorFileUri,
      };
};

export const centerEditorCanvas = (
  state: RootState,
  editorFileUri: string,
  innerBounds?: Bounds,
  smooth: boolean = false,
  zoomOrZoomToFit: boolean | number = true
) => {
  if (!innerBounds) {
    const frames = getFramesByDependencyUri(
      editorFileUri,
      state.frames,
      state.documents,
      state.graph
    );

    if (!frames.length) {
      return state;
    }

    innerBounds = state.selectedInspectorNodes.length
      ? getSelectionBounds(
          state.selectedInspectorNodes,
          state.documents,
          state.frames,
          state.graph
        )
      : getSyntheticWindowBounds(editorFileUri, state);
  }

  // no windows loaded
  if (
    innerBounds.left +
      innerBounds.right +
      innerBounds.top +
      innerBounds.bottom ===
    0
  ) {
    console.warn(` Cannot center when bounds has no size`);
    return updateOpenFileCanvas(
      {
        translate: { left: 0, top: 0, zoom: 1 },
      },
      editorFileUri,
      state
    );
  }

  const editorWindow = getEditorWindowWithFileUri(editorFileUri, state);
  const openFile = getOpenFile(editorFileUri, state.openFiles);
  const { canvasBounds } = editorWindow;

  if (!canvasBounds) {
    console.warn("cannot center canvas without a container");
    return state;
  }

  const {
    canvas: { translate },
  } = openFile;

  const { width, height } = boundsToSize(canvasBounds);

  const innerSize = getBoundsSize(innerBounds);

  const centered = {
    left: -innerBounds.left + width / 2 - innerSize.width / 2,
    top: -innerBounds.top + height / 2 - innerSize.height / 2,
  };

  const scale =
    typeof zoomOrZoomToFit === "boolean"
      ? Math.min(
          (width - INITIAL_ZOOM_PADDING) / innerSize.width,
          (height - INITIAL_ZOOM_PADDING) / innerSize.height
        )
      : typeof zoomOrZoomToFit === "number"
      ? zoomOrZoomToFit
      : translate.zoom;

  state = updateEditorWindow(
    {
      smooth,
    },
    editorFileUri,
    state
  );

  state = updateOpenFileCanvas(
    {
      translate: centerTransformZoom(
        {
          ...centered,
          zoom: 1,
        },
        { left: 0, top: 0, right: width, bottom: height },
        Math.min(scale, 1)
      ),
    },
    editorFileUri,
    state
  );

  return state;
};

export const updateOpenFileCanvas = (
  properties: Partial<Canvas>,
  uri: string,
  root: RootState
) => {
  const openFile = getOpenFile(uri, root.openFiles);
  return updateOpenFile(
    {
      canvas: {
        ...openFile.canvas,
        ...properties,
      },
    },
    uri,
    root
  );
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

export const setTool = (toolType: ToolType, root: RootState) => {
  if (!root.editorWindows.length) {
    return root;
  }
  root = { ...root, selectedComponentId: null };
  root = updateRootState({ toolType }, root);
  return root;
};

export const getActiveFrames = (root: RootState): Frame[] =>
  values(root.frames).filter(
    (frame) =>
      getActiveEditorWindow(root).activeFilePath ===
      getSyntheticDocumentDependencyUri(
        getSyntheticVisibleNodeDocument(
          frame.syntheticContentNodeId,
          root.documents
        ),
        root.graph
      )
  );

export const getCanvasTranslate = (canvas: Canvas) => canvas.translate;

export const getScaledMouseCanvasPosition = (
  state: RootState,
  point: Point
) => {
  const canvas = getOpenFile(
    state.activeEditorFilePath,
    state.openFiles
  ).canvas;
  const translate = getCanvasTranslate(canvas);

  const scaledPageX = (point.left - translate.left) / translate.zoom;
  const scaledPageY = (point.top - translate.top) / translate.zoom;
  return { left: scaledPageX, top: scaledPageY };
};

export const getCanvasMouseTargetNodeId = (
  state: RootState,
  event: React.MouseEvent<any>,
  filter?: (node: TreeNode<any>) => boolean
): string => {
  return getCanvasMouseTargetNodeIdFromPoint(
    state,
    {
      left: event.pageX,
      top: event.pageY,
    },
    filter
  );
};

export const getCanvasMouseTargetInspectorNode = (
  state: RootState,
  event: CanvasToolOverlayMouseMoved | CanvasToolOverlayClicked,
  filter?: (node: TreeNode<any>) => boolean
): InspectorNode => {
  const syntheticNodeId = getCanvasMouseTargetNodeId(
    state,
    event.sourceEvent,
    filter
  );
  if (!syntheticNodeId) {
    return null;
  }
  const syntheticNode = getSyntheticNodeById(
    syntheticNodeId,
    state.documents
  ) as SyntheticVisibleNode;

  const assocInspectorNode = getSyntheticInspectorNode(
    syntheticNode,
    getSyntheticVisibleNodeDocument(syntheticNode.id, state.documents),
    state.sourceNodeInspector,
    state.graph
  );

  const insertableSourceNode = getInsertableInspectorNode(
    assocInspectorNode,
    state.sourceNodeInspector,
    state.graph
  );

  return insertableSourceNode as InspectorNode;
};

const getSelectedInspectorNodeParentShadowId = (state: RootState) => {
  const node = state.selectedInspectorNodes[0];
  if (!node) {
    return null;
  }
  const inspectorNode = getNestedTreeNodeById(
    node.id,
    state.sourceNodeInspector
  );
  const shadow =
    inspectorNode.name === InspectorTreeNodeName.SHADOW
      ? inspectorNode
      : getInspectorNodeParentShadow(inspectorNode, state.sourceNodeInspector);
  return shadow && shadow.id;
};

const defaultCanvasNodeFilter = ({ id }: SyntheticNode, state: RootState) => {
  const syntheticNode = getSyntheticNodeById(id, state.documents);
  const document = getSyntheticVisibleNodeDocument(id, state.documents);
  const inspectorNode = getSyntheticInspectorNode(
    syntheticNode,
    document,
    state.sourceNodeInspector,
    state.graph
  );

  if (!inspectorNode) {
    return false;
  }

  const contentNode =
    getInspectorContentNodeContainingChild(
      inspectorNode,
      state.sourceNodeInspector
    ) || inspectorNode;

  if (inspectorNodeInShadow(inspectorNode, contentNode)) {
    const selectedParentShadowId =
      getSelectedInspectorNodeParentShadowId(state);

    if (selectedParentShadowId) {
      const selectedShadowInspectorNode = getNestedTreeNodeById(
        selectedParentShadowId,
        state.sourceNodeInspector
      );
      const inspectorParentShadow = getInspectorNodeParentShadow(
        inspectorNode,
        state.sourceNodeInspector
      );

      const inspectorNodeWithinSelectedShadow =
        containsNestedTreeNodeById(
          inspectorNode.id,
          selectedShadowInspectorNode
        ) && selectedShadowInspectorNode.id === inspectorParentShadow.id;
      const selectedShadowWithinInspectorParentShadow =
        containsNestedTreeNodeById(
          selectedShadowInspectorNode.id,
          inspectorParentShadow
        );
      if (
        !inspectorNodeWithinSelectedShadow &&
        !selectedShadowWithinInspectorParentShadow
      ) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
};

export const getCanvasMouseTargetNodeIdFromPoint = (
  state: RootState,
  point: Point,
  filter: (
    node: TreeNode<any>,
    state: RootState
  ) => boolean = defaultCanvasNodeFilter
): string => {
  const scaledMousePos = getScaledMouseCanvasPosition(state, point);

  const frame = getFrameFromPoint(scaledMousePos, state);

  if (!frame) return null;
  const contentNode = getSyntheticNodeById(
    frame.syntheticContentNodeId,
    state.documents
  );

  const { left: scaledPageX, top: scaledPageY } = scaledMousePos;

  const mouseX = scaledPageX - frame.bounds.left;
  const mouseY = scaledPageY - frame.bounds.top;

  const computedInfo = frame.computed || {};
  const intersectingBounds: Bounds[] = [];
  const intersectingBoundsMap = new Map<Bounds, string>();
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

  if (!intersectingBounds.length) return null;
  const smallestBounds = getSmallestBounds(...intersectingBounds);
  return intersectingBoundsMap.get(smallestBounds);
};

export const getCanvasMouseFrame = (
  state: RootState,
  event: CanvasToolOverlayMouseMoved | CanvasToolOverlayClicked
) => {
  return getFrameFromPoint(
    getScaledMouseCanvasPosition(state, {
      left: event.sourceEvent.pageX,
      top: event.sourceEvent.pageY,
    }),
    state
  );
};

export const getFrameFromPoint = (point: Point, state: RootState) => {
  const activeFrames = getActiveFrames(state);
  if (!activeFrames.length) return null;
  for (let j = activeFrames.length; j--; ) {
    const frame = activeFrames[j];
    if (pointIntersectsBounds(point, frame.bounds)) {
      return frame;
    }
  }
};

export const setSelectedInspectorNodes = (
  root: RootState,
  selection: InspectorNode[] = EMPTY_ARRAY
) => {
  root = updateRootState(
    {
      selectedInspectorNodes: selection,
    },
    root
  );
  root = expandedSelectedInspectorNode(root);

  return root;
};

const expandedSelectedInspectorNode = (state: RootState) => {
  return state.selectedInspectorNodes.reduce((state, node) => {
    state = updateSourceInspectorNode(state, (sourceNodeInspector) =>
      expandInspectorNodeById(node.id, sourceNodeInspector)
    );
    return state;
  }, state);
};

export const setSelectedFileNodeIds = (
  root: RootState,
  ...selectionIds: string[]
) => {
  const nodeIds = uniq([...selectionIds]);
  root = nodeIds.reduce(
    (state, nodeId) => setRootStateFileNodeExpanded(nodeId, true, root),
    root
  );

  root = updateRootState(
    {
      selectedFileNodeIds: nodeIds,
    },
    root
  );
  return root;
};

export const setHoveringSyntheticVisibleNodeIds = (
  root: RootState,
  selectionIds: string[]
) => {
  const hoveringSyntheticNodeIds = uniq(
    [...selectionIds].filter((nodeId) => {
      const node = getSyntheticNodeById(nodeId, root.documents);

      if (!node) {
        console.warn(`node ${nodeId} does not exist`);
      }

      return Boolean(node);
    })
  );

  return updateRootState(
    {
      hoveringInspectorNodes: hoveringSyntheticNodeIds
        .map((nodeId) => {
          const inspectorNode = getSyntheticInspectorNode(
            getSyntheticNodeById(nodeId, root.documents),
            getSyntheticVisibleNodeDocument(nodeId, root.documents),
            root.sourceNodeInspector,
            root.graph
          );

          return inspectorNode;
        })
        .filter(Boolean),
    },
    root
  );
};

export const setHoveringInspectorNodes = (
  root: RootState,
  hoveringInspectorNodes: InspectorNode[]
) => {
  return updateRootState(
    {
      hoveringInspectorNodes,
    },
    root
  );
};

export const getBoundedSelection = memoize(
  (
    selectedInspectorNodes: InspectorNode[],
    documents: SyntheticDocument[],
    frames: Frame[],
    graph: DependencyGraph
  ): InspectorNode[] => {
    return selectedInspectorNodes.filter((node) => {
      const syntheticNode = getInspectorSyntheticNode(node, documents);
      return (
        syntheticNode &&
        getSyntheticVisibleNodeRelativeBounds(syntheticNode, frames, graph)
      );
    });
  }
);

export const getSelectionBounds = memoize(
  (
    selectedInspectorNodes: InspectorNode[],
    documents: SyntheticDocument[],
    frames: Frame[],
    graph: DependencyGraph
  ) =>
    mergeBounds(
      ...getBoundedSelection(
        selectedInspectorNodes,
        documents,
        frames,
        graph
      ).map((node) =>
        getSyntheticVisibleNodeRelativeBounds(
          getInspectorSyntheticNode(node, documents),
          frames,
          graph
        )
      )
    )
);

export const isSelectionMovable = memoize(
  (
    selectedInspectorNodes: InspectorNode[],
    rootInspectorNode: InspectorNode,
    graph: DependencyGraph
  ) => {
    return selectedInspectorNodes.every((node) => {
      return getInspectorContentNode(node, rootInspectorNode).id === node.id;
    });
  }
);

export const isSelectionResizable = memoize(
  (
    selectedSyntheticNodes: InspectorNode[],
    rootInspectorNode: InspectorNode,
    graph: DependencyGraph
  ) => {
    return selectedSyntheticNodes.every((node) => {
      return getInspectorContentNode(node, rootInspectorNode).id === node.id;
    });
  }
);
