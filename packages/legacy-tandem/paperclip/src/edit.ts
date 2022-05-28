import {
  TreeNodeUpdater,
  EMPTY_OBJECT,
  memoize,
  Bounds,
  updateNestedNode,
  shiftBounds,
  Point,
  moveBounds,
  TreeMoveOffset,
  insertChildNode,
  removeNestedTreeNode,
  getParentTreeNode,
  appendChildNode,
  cloneTreeNode,
  pointIntersectsBounds,
  mergeBounds,
  replaceNestedNode,
  arraySplice,
  stripProtocol,
  getNestedTreeNodeById,
  KeyValue,
  filterNestedNodes,
  EMPTY_ARRAY,
  updateProperties,
} from "tandem-common";
import { values, identity, uniq, last, pickBy, isNull } from "lodash";
import { DependencyGraph, Dependency, isPaperclipUri } from "./graph";
import {
  PCNode,
  getPCNode,
  PCVisibleNode,
  createPCComponent,
  getPCNodeDependency,
  PCSourceTagNames,
  replacePCNode,
  PCComponent,
  PCElement,
  createPCComponentInstance,
  getPCNodeModule,
  PCTextNode,
  PCOverride,
  createPCOverride,
  PCOverridablePropertyName,
  PCVisibleNodeMetadataKey,
  updatePCNodeMetadata,
  createPCVariant,
  PCVariant,
  isComponent,
  getPCVariants,
  isPCOverride,
  PCComponentInstanceElement,
  filterPCNodes,
  isPCComponentInstance,
  StyleMixins,
  PCVariable,
  createPCSlot,
  getPCNodeContentNode,
  PCModule,
  createPCVariable,
  PCVariableType,
  isVoidTagName,
  getDerrivedPCLabel,
  PCQueryType,
  createPCQuery,
  createPCTextStyleMixin,
  createPCElementStyleMixin,
  PCStyleMixin,
  isElementLikePCNode,
  PCVariantTrigger,
  createPCVariantTrigger,
  isPCContentNode,
} from "./dsl";
import {
  SyntheticVisibleNode,
  getSyntheticVisibleNodeDocument,
  getSyntheticNodeById,
  getSyntheticSourceNode,
  getSyntheticDocumentByDependencyUri,
  SyntheticElement,
  isSyntheticNodeImmutable,
  isSyntheticContentNode,
  SyntheticTextNode,
  SyntheticDocument,
  getSyntheticSourceUri,
  getNearestComponentInstances,
  isSyntheticVisibleNode,
  getSyntheticContentNode,
  SyntheticInstanceElement,
  getInheritedAndSelfOverrides,
  SyntheticNode,
} from "./synthetic";
import * as path from "path";
import { convertFixedBoundsToRelative } from "./synthetic-layout";
import { diffTreeNode, patchTreeNode } from "./ot";
import { evaluateDependencyGraph } from "./evaluate";
import { FSSandboxRootState, queueOpenFiles } from "fsbox";
import {
  InspectorNode,
  getInspectorSourceNode,
  inspectorNodeInShadow,
  getSyntheticInspectorNode,
  getInstanceVariantInfo,
  getInspectorContentNode,
  getInspectorSyntheticNode,
  InspectorTreeNodeName,
} from "./inspector";
import {
  getInspectorContentNodeContainingChild,
  getInspectorNodeBySourceNodeId,
} from "./inspector";
import { computeStyleInfo, getTextStyles, filterTextStyles } from "./style";

/*------------------------------------------
 * CONSTANTS
 *-----------------------------------------*/

const NO_POINT = { left: 0, top: 0 };
const NO_BOUNDS = { ...NO_POINT, right: 0, bottom: 0 };
const MAX_CHECKSUM_COUNT = 40;

const FRAME_PADDING = 10;
const MIN_BOUND_SIZE = 1;
const PASTED_FRAME_OFFSET = { left: FRAME_PADDING, top: FRAME_PADDING };

export const DEFAULT_FRAME_BOUNDS: Bounds = {
  left: 0,
  top: 0,
  right: 400,
  bottom: 300,
};

/*------------------------------------------
 * STATE
 *-----------------------------------------*/

export type PCNodeClip = {
  uri?: string;
  node: PCNode;
  fixedBounds?: Bounds;
};

// namespaced to ensure that key doesn't conflict with others
export type PCEditorState = {
  sourceNodeInspector: InspectorNode;
  inEdit?: boolean;
  documents: SyntheticDocument[];

  // key = frame id, value = evaluated frame
  frames: Frame[];

  graph: DependencyGraph;
} & FSSandboxRootState;

export type ComputedDisplayInfo = {
  [identifier: string]: {
    style: CSSStyleDeclaration;
    bounds: Bounds;
  };
};

export type Frame = {
  syntheticContentNodeId: string;
  bounds: Bounds;

  // internal only
  // $container?: HTMLElement;
  computed?: ComputedDisplayInfo;
};

/*------------------------------------------
 * GETTERS
 *-----------------------------------------*/

export const getFramesContentNodeIdMap = memoize(
  (
    frames: Frame[]
  ): {
    [identifier: string]: Frame;
  } => {
    const map = {};
    for (const frame of frames) {
      map[frame.syntheticContentNodeId] = frame;
    }
    return map;
  }
);

export const addPCFileUris = (state: PCEditorState, uris: string[]) => {
  state = queueOpenFiles(uris, state);
  return pruneDependencyGraph(state as any);
};

export const pruneDependencyGraph = <TState extends PCEditorState>(
  state: TState
): TState => {
  const { graph } = state;

  let fullyLoaded: boolean = true;

  for (const uri in state.fileCache) {
    if (isPaperclipUri(uri) && !graph[uri]) {
      fullyLoaded = false;
    }
  }

  // prune old deps
  if (fullyLoaded) {
    let newGraph: DependencyGraph;
    for (const uri in graph) {
      if (!state.fileCache[uri]) {
        if (!newGraph) {
          newGraph = { ...graph };
        }
        delete newGraph[uri];
      }
    }

    if (newGraph) {
      return { ...(state as any), graph: newGraph } as TState;
    }
  }

  return state;
};

export const getSyntheticDocumentFrames = memoize(
  (document: SyntheticDocument, frames: Frame[]) => {
    const frameMap = getFramesContentNodeIdMap(frames);
    return document.children.map((contentNode) => frameMap[contentNode.id]);
  }
);

export const getFramesByDependencyUri = memoize(
  (
    uri: string,
    frames: Frame[],
    documents: SyntheticDocument[],
    graph: DependencyGraph
  ) => {
    const document = getSyntheticDocumentByDependencyUri(uri, documents, graph);
    return document
      ? getSyntheticDocumentFrames(document, frames)
      : EMPTY_ARRAY;
  }
);

export const getSyntheticVisibleNodeComputedBounds = (
  node: SyntheticVisibleNode,
  frame: Frame,
  graph: DependencyGraph
) => {
  return isSyntheticContentNode(node, graph)
    ? moveBounds(frame.bounds, NO_POINT)
    : (frame.computed &&
        frame.computed[node.id] &&
        frame.computed[node.id].bounds) ||
        NO_BOUNDS;
};

export const getSyntheticVisibleNodeFrame = memoize(
  (syntheticNode: SyntheticVisibleNode, frames: Frame[]) =>
    frames.find(
      (frame) =>
        Boolean(frame.computed && frame.computed[syntheticNode.id]) ||
        frame.syntheticContentNodeId === syntheticNode.id
    )
);
export const getFrameByContentNodeId = memoize(
  (nodeId: string, frames: Frame[]) =>
    frames.find((frame) => frame.syntheticContentNodeId === nodeId)
);

export const getSyntheticVisibleNodeRelativeBounds = memoize(
  (
    syntheticNode: SyntheticVisibleNode,
    frames: Frame[],
    graph: DependencyGraph
  ): Bounds => {
    const frame = getSyntheticVisibleNodeFrame(syntheticNode, frames);
    return frame
      ? shiftBounds(
          getSyntheticVisibleNodeComputedBounds(syntheticNode, frame, graph),
          frame.bounds
        )
      : NO_BOUNDS;
  }
);

export const getFrameSyntheticNode = memoize(
  (frame: Frame, documents: SyntheticDocument[]) =>
    getSyntheticNodeById(frame.syntheticContentNodeId, documents)
);

export const getPCNodeClip = (
  node: InspectorNode,
  rootNode: InspectorNode,
  documents: SyntheticDocument[],
  frames: Frame[],
  graph: DependencyGraph
): PCNodeClip => {
  const sourceNode = getInspectorSourceNode(node, rootNode, graph);
  const syntheticNode = getInspectorSyntheticNode(node, documents);
  const contentNode = getInspectorContentNode(node, rootNode);
  const contentSyntheticNode = getInspectorSyntheticNode(
    contentNode,
    documents
  );
  const frame =
    contentSyntheticNode &&
    getSyntheticVisibleNodeFrame(contentSyntheticNode, frames);

  return {
    uri: getPCNodeDependency(node.sourceNodeId, graph).uri,
    node: sourceNode,
    fixedBounds:
      (syntheticNode &&
        (isSyntheticContentNode(syntheticNode, graph)
          ? frame.bounds
          : getSyntheticVisibleNodeRelativeBounds(
              syntheticNode,
              frames,
              graph
            ))) ||
      (frame && frame.bounds),
  };
};

/*------------------------------------------
 * SETTERS
 *-----------------------------------------*/

export const updatePCEditorState = <TState extends PCEditorState>(
  properties: Partial<PCEditorState>,
  state: TState
): TState => {
  return updateProperties(properties as TState, state);
};

export const updateDependencyGraph = <TState extends PCEditorState>(
  properties: Partial<DependencyGraph>,
  state: TState
) =>
  updatePCEditorState(
    {
      graph: {
        ...state.graph,
        ...properties,
      },
    },
    state
  );

const replaceDependencyGraphPCNode = <TState extends PCEditorState>(
  newNode: PCNode,
  oldNode: PCNode,
  state: TState
) => {
  if (
    isPCContentNode(oldNode, state.graph) &&
    newNode &&
    !newNode.metadata[PCVisibleNodeMetadataKey.BOUNDS]
  ) {
    newNode = {
      ...newNode,
      metadata: {
        ...newNode.metadata,
        [PCVisibleNodeMetadataKey.BOUNDS]:
          oldNode.metadata[PCVisibleNodeMetadataKey.BOUNDS] ||
          DEFAULT_FRAME_BOUNDS,
      },
    };
  }
  return updateDependencyGraph(
    replacePCNode(newNode, oldNode, state.graph),
    state
  );
};

export const replaceDependency = <TState extends PCEditorState>(
  dep: Dependency<any>,
  state: TState
) => updateDependencyGraph({ [dep.uri]: dep }, state);

export const removeFrame = <TState extends PCEditorState>(
  { syntheticContentNodeId }: Frame,
  state: TState
) => {
  const frame = getFrameByContentNodeId(syntheticContentNodeId, state.frames);
  if (frame == null) {
    throw new Error(`Frame does not exist`);
  }
  return updatePCEditorState(
    {
      frames: arraySplice(state.frames, state.frames.indexOf(frame), 1),
    },
    state
  );
};

export const getSyntheticDocumentById = memoize(
  (id: string, documents: SyntheticDocument[]) =>
    documents.find((document) => document.id === id)
);

export const updateSyntheticDocument = <TState extends PCEditorState>(
  properties: Partial<SyntheticDocument>,
  { id }: SyntheticDocument,
  state: TState
) => {
  const document = getSyntheticDocumentById(id, state.documents);
  if (!document) {
    throw new Error(` document does not exist`);
  }

  const newDocument = {
    ...document,
    ...properties,
  };

  return upsertFrames({
    ...(state as any),
    documents: arraySplice(
      state.documents,
      state.documents.indexOf(document),
      1,
      newDocument
    ),
  });
};

export const removeInspectorNode = <TState extends PCEditorState>(
  node: InspectorNode,
  state: TState
) => {
  const document = getSyntheticVisibleNodeDocument(node.id, state.documents);
  const syntheticNode = getInspectorSyntheticNode(
    node,
    state.documents
  ) as SyntheticDocument;
  if (!syntheticNode) {
    return null;
  }
  if (getInspectorContentNode(node, state.sourceNodeInspector) === node) {
    state = removeFrame(
      getFrameByContentNodeId(syntheticNode.id, state.frames),
      state
    );
  }

  return updateSyntheticDocument(syntheticNode, document, state);
};

export const replaceSyntheticVisibleNode = <TState extends PCEditorState>(
  replacement: SyntheticVisibleNode,
  node: SyntheticVisibleNode,
  state: TState
) => updateSyntheticVisibleNode(node, state, () => replacement);

export const updateSyntheticVisibleNode = <TState extends PCEditorState>(
  node: SyntheticVisibleNode,
  state: TState,
  updater: TreeNodeUpdater<SyntheticVisibleNode>
) => {
  const document = getSyntheticVisibleNodeDocument(node.id, state.documents);
  return updateSyntheticDocument(
    updateNestedNode(node, document, updater),
    document,
    state
  );
};

export const updateFramePosition = <TState extends PCEditorState>(
  position: Point,
  { syntheticContentNodeId }: Frame,
  state: TState
) => {
  const frame = getFrameByContentNodeId(syntheticContentNodeId, state.frames);
  return updateFrameBounds(moveBounds(frame.bounds, position), frame, state);
};

export const updateFrame = <TState extends PCEditorState>(
  properties: Partial<Frame>,
  { syntheticContentNodeId }: Frame,
  state: TState
) => {
  const frame = getFrameByContentNodeId(syntheticContentNodeId, state.frames);
  if (!frame) {
    throw new Error("frame does not exist");
  }
  return updatePCEditorState(
    {
      frames: arraySplice(state.frames, state.frames.indexOf(frame), 1, {
        ...frame,
        ...properties,
      }),
    },
    state
  );
};

const clampBounds = (bounds: Bounds) => ({
  ...bounds,
  right: Math.max(bounds.right, bounds.left + MIN_BOUND_SIZE),
  bottom: Math.max(bounds.bottom, bounds.top + MIN_BOUND_SIZE),
});

export const updateFrameBounds = <TState extends PCEditorState>(
  bounds: Bounds,
  frame: Frame,
  state: TState
) => {
  return updateFrame(
    {
      bounds: clampBounds(bounds),
    },
    frame,
    state
  );
};

export const updateSyntheticVisibleNodePosition = <
  TState extends PCEditorState
>(
  position: Point,
  node: SyntheticVisibleNode,
  state: TState
) => {
  if (isSyntheticContentNode(node, state.graph)) {
    return updateFramePosition(
      position,
      getSyntheticVisibleNodeFrame(node, state.frames),
      state
    );
  }

  return updateSyntheticVisibleNode(node, state, (node) => {
    const bounds = getSyntheticVisibleNodeRelativeBounds(
      node,
      state.frames,
      state.graph
    );
    const newBounds = convertFixedBoundsToRelative(
      moveBounds(bounds, position),
      node,
      getSyntheticVisibleNodeDocument(node.id, state.documents),
      getSyntheticVisibleNodeFrame(node, state.frames)
    );

    return {
      ...node,
      style: {
        ...node.style,
        left: newBounds.left,
        top: newBounds.top,
      },
    };
  });
};

export const updateSyntheticVisibleNodeBounds = <TState extends PCEditorState>(
  bounds: Bounds,
  node: SyntheticVisibleNode,
  state: TState
) => {
  if (isSyntheticContentNode(node, state.graph)) {
    return updateFrameBounds(
      bounds,
      getSyntheticVisibleNodeFrame(node, state.frames),
      state
    );
  }

  throw new Error("TODO");
};

export const upsertFrames = <TState extends PCEditorState>(state: TState) => {
  const frames: Frame[] = [];

  const framesByContentNodeId = getFramesContentNodeIdMap(state.frames);

  for (const document of state.documents) {
    for (const contentNode of document.children) {
      const sourceNode = getSyntheticSourceNode(
        contentNode as SyntheticNode,
        state.graph
      );

      // synthetic document may be out of sync
      if (!sourceNode) {
        continue;
      }

      const existingFrame = framesByContentNodeId[contentNode.id];

      if (existingFrame) {
        frames.push(
          updateProperties(
            {
              // todo add warning here that bounds do not exist when they should.
              bounds:
                sourceNode.metadata[PCVisibleNodeMetadataKey.BOUNDS] ||
                DEFAULT_FRAME_BOUNDS,
            },
            existingFrame
          )
        );
      } else {
        frames.push({
          syntheticContentNodeId: contentNode.id,

          // todo add warning here that bounds do not exist when they should.
          bounds:
            sourceNode.metadata[PCVisibleNodeMetadataKey.BOUNDS] ||
            DEFAULT_FRAME_BOUNDS,
        });
      }
    }
  }

  return updatePCEditorState({ frames }, state);
};

/*------------------------------------------
 * PERSISTING
 *-----------------------------------------*/

export const persistChangeLabel = <TState extends PCEditorState>(
  newLabel: string,
  sourceNode: PCNode,
  state: TState
) => {
  const newNode = {
    ...sourceNode,
    label: newLabel,
  };

  return replaceDependencyGraphPCNode(newNode, newNode, state);
};

export const persistConvertNodeToComponent = <TState extends PCEditorState>(
  node: InspectorNode,
  state: TState
) => {
  let sourceNode = getInspectorSourceNode(
    node,
    state.sourceNodeInspector,
    state.graph
  ) as PCVisibleNode;

  if (isComponent(sourceNode)) {
    return state;
  }

  let component = createPCComponent(
    sourceNode.label,
    (sourceNode as PCElement).is,
    sourceNode.style,
    (sourceNode as PCElement).attributes,
    sourceNode.name === PCSourceTagNames.TEXT
      ? [cloneTreeNode(sourceNode)]
      : (sourceNode.children || []).map((node) => cloneTreeNode(node)),
    null,
    sourceNode.styleMixins
  );

  if (node.name === InspectorTreeNodeName.CONTENT) {
    component = updatePCNodeMetadata(sourceNode.metadata, component);
    sourceNode = updatePCNodeMetadata(
      {
        [PCVisibleNodeMetadataKey.BOUNDS]: undefined,
      },
      sourceNode
    );
    return replaceDependencyGraphPCNode(component, sourceNode, state);
  }

  const module = getPCNodeModule(sourceNode.id, state.graph);
  state = replaceDependencyGraphPCNode(
    appendChildNode(addBoundsMetadata(node, component, state), module),
    module,
    state
  );

  const componentInstance = createPCComponentInstance(
    component.id,
    null,
    null,
    null,
    null,
    sourceNode.label
  );

  state = replaceDependencyGraphPCNode(componentInstance, sourceNode, state);

  return state;
};

export const persistConvertInspectorNodeStyleToMixin = <
  TState extends PCEditorState
>(
  inspectorNode: InspectorNode,
  variant: PCVariant,
  state: TState,
  justTextStyles?: boolean
) => {
  const sourceNode = getInspectorSourceNode(
    inspectorNode,
    state.sourceNodeInspector,
    state.graph
  ) as PCVisibleNode;
  // const document = getSyntheticVisibleNodeDocument(node.id, state.documents);
  // const inspectorNode = getSyntheticInspectorNode(
  //   node,
  //   document,
  //   state.sourceNodeInspector,
  //   state.graph
  // );
  const computedStyle = computeStyleInfo(
    inspectorNode,
    state.sourceNodeInspector,
    variant,
    state.graph,
    {
      inheritedStyles: false,
      styleMixins: false,
      parentStyles: false,
      overrides: true,
    }
  );

  const style = justTextStyles
    ? filterTextStyles(computedStyle.style)
    : computedStyle.style;
  let styleMixin: PCStyleMixin;

  if (sourceNode.name === PCSourceTagNames.TEXT || justTextStyles) {
    const newLabel = `${sourceNode.label} text style`;
    styleMixin = createPCTextStyleMixin(
      style,
      newLabel,
      sourceNode.styleMixins,
      newLabel
    );
  } else if (isElementLikePCNode(sourceNode)) {
    const newLabel = `${sourceNode.label} style`;
    styleMixin = createPCElementStyleMixin(
      style,
      sourceNode.styleMixins,
      newLabel
    );
  }
  const module = getPCNodeModule(sourceNode.id, state.graph);
  state = replaceDependencyGraphPCNode(
    appendChildNode(
      addBoundsMetadata(inspectorNode, styleMixin, state),
      module
    ),
    module,
    state
  );

  // remove styles from synthetic node since they've been moved to a mixin
  for (const key in style) {
    state = persistCSSProperty(key, undefined, inspectorNode, variant, state);
  }

  state = persistStyleMixin(
    {
      [styleMixin.id]: {
        // TODO - this needs to be part of the variant
        priority: Object.keys(sourceNode.styleMixins || EMPTY_OBJECT).length,
      },
    },
    inspectorNode,
    variant,
    state
  );

  return state;
};

export const persistWrapInSlot = <TState extends PCEditorState>(
  node: InspectorNode,
  state: TState
) => {
  const sourceNode = getInspectorSourceNode(
    node,
    state.sourceNodeInspector,
    state.graph
  ) as PCVisibleNode;

  if (
    getPCNodeContentNode(
      sourceNode.id,
      getPCNodeModule(sourceNode.id, state.graph)
    ).name !== PCSourceTagNames.COMPONENT
  ) {
    return state;
  }

  const newSource = createPCSlot([sourceNode]);

  state = replaceDependencyGraphPCNode(newSource, sourceNode, state);

  return state;
};

const moveBoundsToEmptySpace = (bounds: Bounds, frames: Frame[]) => {
  const intersecting = values(frames).some((frame: Frame) =>
    pointIntersectsBounds(bounds, frame.bounds)
  );
  if (!intersecting) return bounds;
  const entireBounds = getEntireFrameBounds(frames);
  return moveBounds(bounds, {
    left: entireBounds.right + FRAME_PADDING,
    top: entireBounds.top,
  });
};

export const getEntireFrameBounds = (frames: Frame[]) =>
  mergeBounds(...values(frames).map((frame) => frame.bounds));

export const persistAddComponentController = <TState extends PCEditorState>(
  uri: string,
  target: SyntheticVisibleNode,
  state: TState
) => {
  let sourceNode = getSyntheticSourceNode(target, state.graph) as PCComponent;
  const sourceNodeDep = getPCNodeDependency(sourceNode.id, state.graph);

  let relativePath = path.relative(
    path.dirname(stripProtocol(sourceNodeDep.uri)),
    stripProtocol(uri)
  );
  if (relativePath.charAt(0) !== ".") {
    relativePath = "./" + relativePath;
  }

  sourceNode = {
    ...sourceNode,
    controllers: uniq(
      sourceNode.controllers
        ? [...sourceNode.controllers, relativePath]
        : [relativePath]
    ),
  };

  return replaceDependencyGraphPCNode(sourceNode, sourceNode, state);
};

export const persistRemoveComponentController = <TState extends PCEditorState>(
  relativePath: string,
  target: SyntheticVisibleNode,
  state: TState
) => {
  let sourceNode = getSyntheticSourceNode(target, state.graph) as PCComponent;
  sourceNode = {
    ...sourceNode,
    controllers: arraySplice(
      sourceNode.controllers,
      sourceNode.controllers.indexOf(relativePath),
      1
    ),
  };

  return replaceDependencyGraphPCNode(sourceNode, sourceNode, state);
};

/**
 * Synchronizes updated documents from the runtime engine. Updates are likely to be _behind_ in terms of
 * changes, so the editor state is the source of truth for the synthetic document to ensure that it doesn't
 * get clobbered with a previous version (which will cause bugs).
 */

export const syncSyntheticDocuments = <TState extends PCEditorState>(
  updatedDocuments: SyntheticDocument[],
  state: TState
) => {
  return upsertFrames({
    ...(state as any),
    documents: updatedDocuments,
  });
};

export const persistInsertNode = <TState extends PCEditorState>(
  newChild: PCNode,
  { id: relativeId }: PCNode,
  offset: TreeMoveOffset,
  state: TState
) => {
  let parentSource: PCNode;

  if (getPCNodeModule(newChild.id, state.graph)) {
    // remove the child first
    state = replaceDependencyGraphPCNode(null, newChild, state);
  }

  const relative = getPCNode(relativeId, state.graph);

  if (relative.name === PCSourceTagNames.MODULE) {
    parentSource = appendChildNode(newChild, relative);
  } else {
    let index: number;
    if (offset === TreeMoveOffset.APPEND || offset === TreeMoveOffset.PREPEND) {
      parentSource = relative;
      index =
        offset === TreeMoveOffset.PREPEND ? 0 : parentSource.children.length;
    } else {
      const module = getPCNodeModule(relative.id, state.graph);

      parentSource = getParentTreeNode(relative.id, module);
      index =
        parentSource.children.indexOf(relative) +
        (offset === TreeMoveOffset.BEFORE ? 0 : 1);
    }
    parentSource = insertChildNode(newChild, index, parentSource);
  }

  return replaceDependencyGraphPCNode(parentSource, parentSource, state);
};

export const persistAddVariant = <TState extends PCEditorState>(
  label: string,
  contentNode: SyntheticVisibleNode,
  state: TState
): TState => {
  const component = getSyntheticSourceNode(contentNode, state.graph);
  state = replaceDependencyGraphPCNode(
    appendChildNode(createPCVariant(label, true), component),
    component,
    state
  );
  return state;
};

export const persistRemoveVariant = <TState extends PCEditorState>(
  variant: PCVariant,
  state: TState
): TState => {
  const module = getPCNodeModule(variant.id, state.graph);
  state = replaceDependencyGraphPCNode(
    removeNestedTreeNode(variant, module),
    module,
    state
  );
  return state;
};

export const persistUpdateVariant = <TState extends PCEditorState>(
  properties: Partial<PCVariant>,
  variant: PCVariant,
  state: TState
): TState => {
  state = replaceDependencyGraphPCNode(
    { ...variant, ...properties },
    variant,
    state
  );
  return state;
};

export const persistToggleInstanceVariant = <TState extends PCEditorState>(
  instance: InspectorNode,
  targetVariantId: string,
  variant: PCVariant,
  state: TState
): TState => {
  const instanceVariantInfo = getInstanceVariantInfo(
    instance,
    state.sourceNodeInspector,
    state.graph
  );
  const variantInfo = instanceVariantInfo.find(
    (info) => info.variant.id === targetVariantId
  );

  const node = maybeOverride2(
    PCOverridablePropertyName.VARIANT,
    null,
    variant,
    (value, override) => {
      return override
        ? {
            ...override.value,
            [targetVariantId]: !override.value[targetVariantId],
          }
        : { [targetVariantId]: !variantInfo.enabled };
    },
    (node: PCComponentInstanceElement) => ({
      ...node,
      variant: {
        ...node.variant,
        [targetVariantId]: !variantInfo.enabled,
      },
    })
  )(
    instance.instancePath,
    instance.sourceNodeId,
    state.sourceNodeInspector,
    state.graph
  );

  state = replaceDependencyGraphPCNode(node, node, state);
  return state;
};

export const persistAddVariantTrigger = <TState extends PCEditorState>(
  component: InspectorNode,
  state: TState
): TState => {
  const sourceNode = getInspectorSourceNode(
    component,
    state.sourceNodeInspector,
    state.graph
  );
  state = replaceDependencyGraphPCNode(
    appendChildNode(createPCVariantTrigger(null, null), sourceNode),
    sourceNode,
    state
  );
  return state;
};

export const persistUpdateVariantTrigger = <TState extends PCEditorState>(
  properties: Partial<PCVariantTrigger>,
  trigger: PCVariantTrigger,
  state: TState
): TState => {
  state = replaceDependencyGraphPCNode(
    {
      ...trigger,
      ...properties,
    },
    trigger,
    state
  );
  return state;
};

export const persistRemoveVariantOverride = <TState extends PCEditorState>(
  instance: SyntheticInstanceElement,
  targetVariantId: string,
  variant: PCVariant,
  state: TState
): TState => {
  const override = getInheritedAndSelfOverrides(
    instance,
    getSyntheticVisibleNodeDocument(instance.id, state.documents),
    state.graph,
    variant && variant.id
  ).find((override) => last(override.targetIdPath) === targetVariantId);
  return replaceDependencyGraphPCNode(null, override, state);
};

export const persistReplacePCNode = <TState extends PCEditorState>(
  newChild: PCNode,
  oldChild: PCNode,
  state: TState
) => {
  return replaceDependencyGraphPCNode(newChild, oldChild, state);
};

export const persistStyleMixin = <TState extends PCEditorState>(
  styleMixins: StyleMixins,
  node: InspectorNode,
  variant: PCVariant,
  state: TState
) => {
  const sourceNode = getInspectorSourceNode(
    node,
    state.sourceNodeInspector,
    state.graph
  ) as PCVisibleNode;
  // const sourceNode = maybeOverride(
  //   PCOverridablePropertyName.INHERIT_STYLE,
  //   styleMixins,
  //   variant,
  //   (value, override) => {
  //     const prevStyle = (override && override.value) || EMPTY_OBJECT;
  //     return overrideKeyValue(node.style, prevStyle, {
  //       ...prevStyle,
  //       ...value
  //     });
  //   },
  //   (node: PCBaseVisibleNode<any>) => ({
  //     ...node,
  //     styleMixins: omitNull({
  //       ...(node.styleMixins || EMPTY_OBJECT),
  //       ...styleMixins
  //     })
  //   })
  // )(node, state.documents, state.graph);

  state = replaceDependencyGraphPCNode(
    {
      ...sourceNode,
      styleMixins: omitNull({
        ...(sourceNode.styleMixins || EMPTY_OBJECT),
        ...styleMixins,
      }),
    } as PCVisibleNode,
    sourceNode,
    state
  );

  return state;
};

export const persistStyleMixinComponentId = <TState extends PCEditorState>(
  oldComponentId: string,
  newComponentId: string,
  node: SyntheticVisibleNode,
  variant: PCVariant,
  state: TState
) => {
  // const sourceNode = maybeOverride(
  //   PCOverridablePropertyName.INHERIT_STYLE,
  //   null,
  //   variant,
  //   (value, override) => {
  //     const prevStyle = (override && override.value) || EMPTY_OBJECT;
  //     return overrideKeyValue(node.style, prevStyle, {
  //       ...prevStyle,
  //       [oldComponentId]: undefined,
  //       [newComponentId]: prevStyle[oldComponentId] || { priority: 0 }
  //     });
  //   },
  //   (node: PCBaseVisibleNode<any>) => ({
  //     ...node,
  // styleMixins: {
  //   ...(node.styleMixins || EMPTY_OBJECT),
  //   [oldComponentId]: undefined,
  //   [newComponentId]: node.styleMixins[oldComponentId]
  // }
  //   })
  // )(node, state.documents, state.graph);
  const sourceNode = getSyntheticSourceNode(node, state.graph) as PCVisibleNode;

  state = replaceDependencyGraphPCNode(
    {
      ...sourceNode,
      styleMixins: {
        ...(sourceNode.styleMixins || EMPTY_OBJECT),
        [oldComponentId]: undefined,
        [newComponentId]: sourceNode.styleMixins[oldComponentId],
      },
    } as PCVisibleNode,
    sourceNode,
    state
  );

  // state = replaceDependencyGraphPCNode(sourceNode, sourceNode, state);

  return state;
};

export const persistAppendPCClips = <TState extends PCEditorState>(
  clips: PCNodeClip[],
  target: InspectorNode,
  offset: TreeMoveOffset,
  state: TState
): TState => {
  const targetSourceNode = getPCNode(target.sourceNodeId, state.graph);
  const targetDep = getPCNodeDependency(targetSourceNode.id, state.graph);
  const parentSourceNode: PCNode =
    offset === TreeMoveOffset.BEFORE || offset === TreeMoveOffset.AFTER
      ? getParentTreeNode(targetSourceNode.id, targetDep.content)
      : targetSourceNode;
  const insertIndex =
    offset === TreeMoveOffset.BEFORE
      ? parentSourceNode.children.indexOf(targetSourceNode)
      : offset === TreeMoveOffset.AFTER
      ? parentSourceNode.children.indexOf(targetSourceNode) + 1
      : offset === TreeMoveOffset.APPEND
      ? parentSourceNode.children.length
      : 0;

  const targetNodeIsModule = parentSourceNode === targetDep.content;

  let content = targetDep.content;

  for (const { node, fixedBounds = DEFAULT_FRAME_BOUNDS } of clips) {
    const sourceNode = node;

    // If there is NO source node, then possibly create a detached node and add to target component
    if (!sourceNode) {
      throw new Error("not implemented");
    }

    // is component
    if (sourceNode.name === PCSourceTagNames.COMPONENT) {
      const componentInstance = createPCComponentInstance(
        sourceNode.id,
        null,
        null,
        null,
        null,
        getDerrivedPCLabel(sourceNode as PCComponent, state.graph)
      );

      if (targetNodeIsModule) {
        content = insertChildNode(
          updatePCNodeMetadata(
            {
              [PCVisibleNodeMetadataKey.BOUNDS]: shiftBounds(
                fixedBounds,
                PASTED_FRAME_OFFSET
              ),
            },
            componentInstance
          ),
          insertIndex,
          content
        );
      } else {
        content = replaceNestedNode(
          insertChildNode(componentInstance, insertIndex, parentSourceNode),
          parentSourceNode.id,
          content
        );
      }
    } else {
      let clonedChild = cloneTreeNode(sourceNode);
      if (
        targetNodeIsModule &&
        !clonedChild.metadata[PCVisibleNodeMetadataKey.BOUNDS]
      ) {
        clonedChild = updatePCNodeMetadata(
          {
            [PCVisibleNodeMetadataKey.BOUNDS]: shiftBounds(
              fixedBounds,
              PASTED_FRAME_OFFSET
            ),
          },
          clonedChild
        );
      }

      content = replaceNestedNode(
        insertChildNode(clonedChild, insertIndex, parentSourceNode),
        parentSourceNode.id,
        content
      );
    }
  }

  state = replaceDependencyGraphPCNode(content, content, state);

  return state;
};

export const persistChangeSyntheticTextNodeValue = <
  TState extends PCEditorState
>(
  value: string,
  node: InspectorNode,
  state: TState
) => {
  const updatedNode = maybeOverride2(
    PCOverridablePropertyName.TEXT,
    value,
    null,
    identity,
    (sourceNode: PCTextNode) => ({
      ...sourceNode,
      value,
    })
  )(
    node.instancePath,
    node.sourceNodeId,
    state.sourceNodeInspector,
    state.graph
  );

  state = replaceDependencyGraphPCNode(updatedNode, updatedNode, state);
  return state;
};

export const persistChangeElementType = <TState extends PCEditorState>(
  typeOrComponentId: string,
  sourceNode: PCComponent | PCComponent | PCElement,
  state: TState
) => {
  const maybeComponent = getPCNode(typeOrComponentId, state.graph);

  if (maybeComponent || sourceNode.name === PCSourceTagNames.COMPONENT) {
    sourceNode = {
      ...sourceNode,
      variant: EMPTY_OBJECT,
      name:
        sourceNode.name === PCSourceTagNames.COMPONENT
          ? PCSourceTagNames.COMPONENT
          : PCSourceTagNames.COMPONENT_INSTANCE,
      is: typeOrComponentId,

      // obliterate children, slots, and overrides associated with previous component since we don't have
      // an exact way to map slots and other stuff over to the new instance type. Might change later on though if we match labels.
      // We _could_ also display "orphaned" plugs that may be re-targeted to slots
      children: EMPTY_ARRAY,
    } as PCComponent;
  } else {
    sourceNode = {
      ...sourceNode,
      name: PCSourceTagNames.ELEMENT,
      is: typeOrComponentId,

      // only copy children over if the prevuous node was an element
      children:
        sourceNode.name === PCSourceTagNames.ELEMENT &&
        !isVoidTagName(typeOrComponentId)
          ? sourceNode.children
          : EMPTY_ARRAY,
    } as PCElement;
  }

  state = replaceDependencyGraphPCNode(sourceNode, sourceNode, state);
  return state;
};

// TODO: style overrides, variant style overrides
const maybeOverride2 =
  (
    propertyName: PCOverridablePropertyName,
    value: any,
    variant: PCVariant,
    mapOverride: (value, override) => any,
    updater: (node: PCNode, value: any) => any
  ) =>
  (
    instancePath: string,
    nodeId: string,
    rootInspector: InspectorNode,
    graph: DependencyGraph
  ) => {
    const sourceNode = getPCNode(nodeId, graph);
    const instancePathParts: string[] = instancePath
      ? instancePath.split(".")
      : EMPTY_ARRAY;

    // if content node does not exist, then target node must be id
    const topMostNodeId = instancePathParts.length
      ? instancePathParts[0]
      : nodeId;
    const topMostInspectorNode = getInspectorNodeBySourceNodeId(
      topMostNodeId,
      rootInspector
    );

    // call getInspectorNodeBySourceNodeId on parent if assoc inspector node doesn't exist. In this case, we're probably dealing with a source node
    // that does not have an assoc inspector node, so we defer to the owner (parent) instead.
    const contentNode =
      getInspectorContentNodeContainingChild(
        topMostInspectorNode,
        rootInspector
      ) || topMostInspectorNode;

    const contentSourceNode = getInspectorSourceNode(
      contentNode,
      rootInspector,
      graph
    );

    const variantId =
      variant &&
      getNestedTreeNodeById(variant.id, contentSourceNode) &&
      variant.id;

    if (instancePathParts.length || variantId) {
      // if instancePath does NOT exist, then we're dealing with a variant
      const targetInstancePathParts = instancePathParts.length
        ? instancePathParts
        : EMPTY_ARRAY;
      const [topMostInstanceId = contentSourceNode.id, ...nestedInstanceIds] =
        targetInstancePathParts;
      const targetIdPathParts = [...nestedInstanceIds];

      // if source id is content id, then target is component root
      if (sourceNode.id !== contentSourceNode.id) {
        targetIdPathParts.push(sourceNode.id);
      }

      const targetIdPath = targetIdPathParts.join(".");

      const topMostInstanceNode = getPCNode(topMostInstanceId, graph);
      let existingOverride = topMostInstanceNode.children.find(
        (child: PCNode) => {
          return (
            child.name === PCSourceTagNames.OVERRIDE &&
            child.propertyName === propertyName &&
            child.targetIdPath.join(".") === targetIdPath &&
            child.variantId == variantId
          );
        }
      ) as PCOverride;

      value = mapOverride(value, existingOverride);

      if (existingOverride) {
        if (value == null) {
          return removeNestedTreeNode(existingOverride, topMostInstanceNode);
        }
        if (
          existingOverride.propertyName === PCOverridablePropertyName.CHILDREN
        ) {
          existingOverride = {
            ...existingOverride,
            children: value,
          };
        } else {
          existingOverride = {
            ...existingOverride,
            value,
          };
        }

        return replaceNestedNode(
          existingOverride,
          existingOverride.id,
          topMostInstanceNode
        );
      } else {
        const override = createPCOverride(
          targetIdPathParts,
          propertyName,
          value,
          variantId
        );
        return appendChildNode(override, topMostInstanceNode);
      }
    }

    return updater(sourceNode, value);
  };

export const persistAddVariable = <TState extends PCEditorState>(
  label: string,
  type: PCVariableType,
  value: string,
  module: PCModule,
  state: TState
) => {
  return updateDependencyGraph(
    replacePCNode(
      appendChildNode(createPCVariable(label, type, value), module),
      module,
      state.graph
    ),
    state
  );
};

export const persistAddQuery = <TState extends PCEditorState>(
  type: PCQueryType,
  condition: any,
  label: string,
  module: PCModule,
  state: TState
) => {
  return updateDependencyGraph(
    replacePCNode(
      appendChildNode(createPCQuery(type, label, condition), module),
      module,
      state.graph
    ),
    state
  );
};

export const persistUpdateVariable = <TState extends PCEditorState>(
  properties: Partial<PCVariable>,
  { id }: PCVariable,
  state: TState
) => {
  const target = getPCNode(id, state.graph);
  return updateDependencyGraph(
    replacePCNode(
      { ...target, ...properties } as PCVariable,
      target,
      state.graph
    ),
    state
  );
};

const maybeOverride =
  (
    propertyName: PCOverridablePropertyName,
    value: any,
    variant: PCVariant,
    mapOverride: (value, override) => any,
    updater: (node: PCNode, value: any) => any
  ) =>
  <TState extends PCEditorState>(
    node: SyntheticVisibleNode,
    documents: SyntheticDocument[],
    graph: DependencyGraph,
    targetSourceId: string = node.sourceNodeId
  ): PCVisibleNode => {
    const sourceNode = getPCNode(targetSourceId, graph) as PCVisibleNode;
    const contentNode = getSyntheticContentNode(node, documents);
    if (!contentNode) {
      return updater(sourceNode, value);
    }
    const contentSourceNode = getSyntheticSourceNode(contentNode, graph);
    const variantId =
      variant &&
      getNestedTreeNodeById(variant.id, contentSourceNode) &&
      variant.id;
    const defaultVariantIds = isComponent(contentSourceNode)
      ? getPCVariants(contentSourceNode)
          .filter((variant) => variant.isDefault)
          .map((variant) => variant.id)
      : [];
    const variantOverrides = (
      filterNestedNodes(
        contentSourceNode,
        (node) =>
          isPCOverride(node) &&
          defaultVariantIds.indexOf((node as PCOverride).variantId) !== -1
      ) as any as PCOverride[]
    ).filter(
      (override: PCOverride) =>
        last(override.targetIdPath) === sourceNode.id ||
        (override.targetIdPath.length === 0 &&
          sourceNode.id === contentSourceNode.id)
    );

    if (
      isSyntheticNodeImmutable(
        node,
        getSyntheticVisibleNodeDocument(node.id, documents),
        graph
      ) ||
      variantId ||
      variantOverrides.length ||
      targetSourceId !== node.sourceNodeId
    ) {
      const document = getSyntheticVisibleNodeDocument(node.id, documents);

      const nearestComponentInstances = getNearestComponentInstances(
        node,
        document,
        graph
      ) as SyntheticNode[];

      const mutableInstance: SyntheticVisibleNode =
        nearestComponentInstances.find(
          (instance) => !(instance as any).immutable
        ) as SyntheticVisibleNode;

      const mutableInstanceSourceNode = getSyntheticSourceNode(
        mutableInstance,
        graph
      ) as PCVisibleNode;

      // source node is an override, so go through the normal updater
      // if (getNestedTreeNodeById(sourceNode.id, furthestInstanceSourceNode)) {
      //   return updater(sourceNode, value);
      // }

      let overrideIdPath = uniq([
        ...nearestComponentInstances
          .slice(0, nearestComponentInstances.indexOf(mutableInstance))
          .reverse()
          .map((node: SyntheticVisibleNode) => node.sourceNodeId),
      ]);

      if (
        sourceNode.id !== contentSourceNode.id &&
        !(
          overrideIdPath.length === 0 &&
          sourceNode.id === mutableInstanceSourceNode.id
        )
      ) {
        overrideIdPath.push(sourceNode.id);
      }

      // ensure that we skip overrides
      overrideIdPath = overrideIdPath.filter((id, index, path: string[]) => {
        // is the target
        if (index === path.length - 1) {
          return true;
        }

        return !getNestedTreeNodeById(path[index + 1], getPCNode(id, graph));
      });

      let existingOverride = mutableInstanceSourceNode.children.find(
        (child: PCOverride) => {
          return (
            child.name === PCSourceTagNames.OVERRIDE &&
            child.targetIdPath.join("/") === overrideIdPath.join("/") &&
            child.propertyName === propertyName &&
            (!variantId || child.variantId == variantId)
          );
        }
      ) as PCOverride;

      value = mapOverride(value, existingOverride);

      if (existingOverride) {
        if (value == null) {
          return removeNestedTreeNode(
            existingOverride,
            mutableInstanceSourceNode
          );
        }
        if (
          existingOverride.propertyName === PCOverridablePropertyName.CHILDREN
        ) {
          existingOverride = {
            ...existingOverride,
            children: value,
          };
        } else {
          existingOverride = {
            ...existingOverride,
            value,
          };
        }

        return replaceNestedNode(
          existingOverride,
          existingOverride.id,
          mutableInstanceSourceNode
        );
      } else if (
        isSyntheticNodeImmutable(
          node,
          getSyntheticVisibleNodeDocument(node.id, documents),
          graph
        ) ||
        variantId ||
        node.id !== targetSourceId
      ) {
        const override = createPCOverride(
          overrideIdPath,
          propertyName,
          value,
          variantId
        );
        return appendChildNode(override, mutableInstanceSourceNode);
      }
    }

    return updater(sourceNode, value);
  };

export const persistSyntheticVisibleNodeBounds = <TState extends PCEditorState>(
  node: SyntheticVisibleNode,
  state: TState
) => {
  const document = getSyntheticVisibleNodeDocument(node.id, state.documents);
  if (isSyntheticContentNode(node, state.graph)) {
    const frame = getSyntheticVisibleNodeFrame(node, state.frames) as Frame;
    const sourceNode = getSyntheticSourceNode(node, state.graph);
    return replaceDependencyGraphPCNode(
      updatePCNodeMetadata(
        {
          [PCVisibleNodeMetadataKey.BOUNDS]: frame.bounds,
        },
        sourceNode
      ),
      sourceNode,
      state
    );
  } else {
    throw new Error("TODO");
  }
};

// aias for inserting node
export const persistMoveSyntheticVisibleNode = <TState extends PCEditorState>(
  sourceNode: PCNode,
  relative: PCNode,
  offset: TreeMoveOffset,
  state: TState
) => {
  return persistInsertNode(sourceNode, relative, offset, state);
};

export const persistSyntheticNodeMetadata = <TState extends PCEditorState>(
  metadata: KeyValue<any>,
  node: SyntheticVisibleNode | SyntheticDocument,
  state: TState
) => {
  const oldState = state;
  if (isSyntheticVisibleNode(node)) {
    state = updateSyntheticVisibleNode(node, state, (node) => ({
      ...node,
      metadata: {
        ...node.metadata,
        ...metadata,
      },
    }));
  }
  let sourceNode = getSyntheticSourceNode(node, state.graph);
  sourceNode = updatePCNodeMetadata(metadata, sourceNode);
  return replaceDependencyGraphPCNode(sourceNode, sourceNode, state);
};

const addBoundsMetadata = (
  node: InspectorNode,
  child: PCVisibleNode | PCComponent | PCStyleMixin,
  state: PCEditorState
) => {
  const syntheticNode = getInspectorSyntheticNode(node, state.documents);
  const contentNode = getInspectorContentNode(node, state.sourceNodeInspector);
  const syntheticContentNode = getInspectorSyntheticNode(
    contentNode,
    state.documents
  );

  if (!syntheticNode && !syntheticContentNode) {
    console.error(`Synthetic node is invisible`);
    // const sourceNode = getInspectorSourceNode(node, state.sourceNodeInspector, state.graph);

    return updatePCNodeMetadata(
      {
        [PCVisibleNodeMetadataKey.BOUNDS]: DEFAULT_FRAME_BOUNDS,
      },
      child
    );
  }
  const document = getSyntheticVisibleNodeDocument(
    syntheticNode.id,
    state.documents
  );
  const frame = getSyntheticVisibleNodeFrame(
    syntheticContentNode,
    state.frames
  );
  const syntheticNodeBounds = getSyntheticVisibleNodeRelativeBounds(
    syntheticNode,
    state.frames,
    state.graph
  );

  let bestBounds = syntheticNodeBounds
    ? moveBounds(syntheticNodeBounds, frame.bounds)
    : DEFAULT_FRAME_BOUNDS;

  const documentFrames = getSyntheticDocumentFrames(document, state.frames);
  bestBounds = moveBoundsToEmptySpace(bestBounds, documentFrames);

  return updatePCNodeMetadata(
    {
      [PCVisibleNodeMetadataKey.BOUNDS]: bestBounds,
    },
    child
  );
};

export const persistRawCSSText = <TState extends PCEditorState>(
  text: string,
  node: InspectorNode,
  variant: PCVariant,
  state: TState
) => {
  const newStyle = parseStyle(text || "");
  return persistInspectorNodeStyle(newStyle, node, variant, state);
};

const omitNull = (object: KeyValue<any>) => {
  return pickBy(object, (value) => {
    return value != null;
  });
};

export const persistCSSProperty = <TState extends PCEditorState>(
  name: string,
  value: string,
  inspectorNode: InspectorNode,
  variant: PCVariant,
  state: TState,
  allowUnset?: boolean
) => {
  if (value === "") {
    value = undefined;
  }

  const computedStyle = computeStyleInfo(
    inspectorNode,
    state.sourceNodeInspector,
    variant,
    state.graph
  );

  if (value == null) {
    const overridingStyles = computeStyleInfo(
      inspectorNode,
      state.sourceNodeInspector,
      variant,
      state.graph,
      {
        self: false,
      }
    );

    if (overridingStyles.style[name] && allowUnset !== false) {
      value = "unset";
    }
  }

  const updatedNode = maybeOverride2(
    PCOverridablePropertyName.STYLE,
    { [name]: value },
    variant,
    (style, override) => {
      const prevStyle = (override && override.value) || EMPTY_OBJECT;

      // note that we're omitting null since that kind of value may accidentally override parent props which
      // doesn't transpile to actually overrides styles.
      return overrideKeyValue(
        computedStyle,
        prevStyle,
        omitNull({
          ...prevStyle,
          ...style,
        })
      );
    },
    (sourceNode: PCVisibleNode) => {
      return {
        ...sourceNode,
        style: omitNull({
          ...sourceNode.style,
          [name]: value,
        }),
      } as PCVisibleNode;
    }
  )(
    inspectorNode.instancePath,
    inspectorNode.sourceNodeId,
    state.sourceNodeInspector,
    state.graph
  );

  return replaceDependencyGraphPCNode(updatedNode, updatedNode, state);
};

export const persistCSSProperties = <TState extends PCEditorState>(
  properties: KeyValue<string>,
  inspectorNode: InspectorNode,
  variant: PCVariant,
  state: TState
) => {
  state = persistInspectorNodeStyle(
    properties,
    inspectorNode,
    variant,
    state,
    false
  );
  return state;
};

export const persistAttribute = <TState extends PCEditorState>(
  name: string,
  value: string,
  element: SyntheticElement,
  state: TState
) => {
  if (value === "") {
    value = undefined;
  }
  const updatedNode = maybeOverride(
    PCOverridablePropertyName.ATTRIBUTES,
    { [name]: value },
    null,
    (attributes, override) => {
      return overrideKeyValue(
        element.attributes,
        (override && override.value) || EMPTY_OBJECT,
        attributes
      );
    },
    (sourceNode: PCElement) =>
      ({
        ...sourceNode,
        attributes: omitNull({
          ...sourceNode.attributes,
          [name]: value,
        }),
      } as PCVisibleNode)
  )(element, state.documents, state.graph);

  return replaceDependencyGraphPCNode(updatedNode, updatedNode, state);
};

export const persistInspectorNodeStyle = <TState extends PCEditorState>(
  newStyle: any,
  node: InspectorNode,
  variant: PCVariant,
  state: TState,
  clear: boolean = true
) => {
  const existingStyle = computeStyleInfo(
    node,
    state.sourceNodeInspector,
    variant,
    state.graph
  ).style;

  for (const key in newStyle) {
    if (newStyle[key] === existingStyle[key]) {
      continue;
    }
    state = persistCSSProperty(key, newStyle[key], node, variant, state);
  }

  if (clear) {
    for (const key in existingStyle) {
      if (newStyle[key]) {
        continue;
      }
      state = persistCSSProperty(key, undefined, node, variant, state, false);
    }
  }

  return state;
};

export const canremoveInspectorNode = <TState extends PCEditorState>(
  node: SyntheticVisibleNode,
  state: TState
) => {
  const sourceNode = getSyntheticSourceNode(node, state.graph);

  if (!isComponent(sourceNode)) {
    return true;
  }

  const instancesOfComponent = filterPCNodes(state.graph, (node) => {
    return (
      (isPCComponentInstance(node) || isComponent(node)) &&
      node.is === sourceNode.id
    );
  });

  return instancesOfComponent.length === 0;
};

export const canRemovePCNode = <TState extends PCEditorState>(
  sourceNode: PCNode,
  state: TState
) => {
  if (!isComponent(sourceNode)) {
    return true;
  }

  const instancesOfComponent = filterPCNodes(state.graph, (node) => {
    return (
      (isPCComponentInstance(node) || isComponent(node)) &&
      node.is === sourceNode.id
    );
  });

  return instancesOfComponent.length === 0;
};

export const persistRemoveInspectorNode = <TState extends PCEditorState>(
  node: InspectorNode,
  state: TState
) => {
  // if the node is immutable, then it is part of an instance, so override the
  // style instead
  inspectorNodeInShadow;

  if (
    inspectorNodeInShadow(
      node,
      getInspectorContentNode(node, state.sourceNodeInspector)
    )
  ) {
    return persistInspectorNodeStyle({ display: "none" }, node, null, state);
  }

  return persistRemovePCNode(getPCNode(node.sourceNodeId, state.graph), state);
};

export const persistRemovePCNode = <TState extends PCEditorState>(
  sourceNode: PCNode,
  state: TState
) => {
  return replaceDependencyGraphPCNode(null, sourceNode, state);
};

const parseStyle = (source: string) => {
  const style = {};
  source.split(";").forEach((decl) => {
    const [key, ...values] = decl.split(":");
    if (!key || !values.length) return;
    style[key.trim()] = values.join(":").trim();
  });
  return style;
};

const overrideKeyValue = (main, oldOverrides, newOverrides) => {
  const minOverrides = {};
  for (const key in newOverrides) {
    if (oldOverrides[key] != null || main[key] !== newOverrides[key]) {
      minOverrides[key] = newOverrides[key];
    }
  }
  return minOverrides;
};

// to be used only in tests
export const evaluateEditedStateSync = (state: PCEditorState) => {
  const documents: SyntheticDocument[] = [];
  const newDocuments = evaluateDependencyGraph(state.graph, null, EMPTY_OBJECT);
  for (const uri in newDocuments) {
    const newDocument = newDocuments[uri];
    const oldDocument = getSyntheticDocumentByDependencyUri(
      uri,
      state.documents,
      state.graph
    );
    documents.push(
      oldDocument
        ? patchTreeNode(diffTreeNode(oldDocument, newDocument), oldDocument)
        : newDocument
    );
  }

  state = upsertFrames({ ...state, documents });

  return state;
};
