import { DependencyGraph } from "./graph";
import {
  PCNode,
  PCSourceTagNames,
  getPCNode,
  extendsComponent,
  PCOverride,
  PCVariantOverride,
  PCComponentInstanceElement,
  PCComponent,
  getOverrides,
  PCVariant,
  isVisibleNode,
  isComponent,
  isSlot,
  PCModule,
  getComponentSlots,
  PCSlot,
  PCOverridablePropertyName,
  getSlotPlug,
  getPCNodeModule,
  getPCVariants,
  PCBaseValueOverride,
  getPCNodeContentNode,
  getInstanceShadow,
  getPCNodeDependency
} from "./dsl";
import { last } from "lodash";

import {
  getSyntheticDocumentsSourceMap,
  getSyntheticNodeById,
  SyntheticNode,
  SyntheticDocument,
  getSyntheticInstancePath,
  SyntheticVisibleNode,
  getSyntheticSourceNode,
  getSyntheticDocumentByDependencyUri
} from "./synthetic";

import {
  diffTreeNode,
  TreeNodeOperationalTransformType,
  patchTreeNode
} from "./ot";

import {
  TreeNode,
  generateUID,
  EMPTY_ARRAY,
  updateNestedNode,
  flattenTreeNode,
  memoize,
  KeyValue,
  getParentTreeNode,
  findTreeNodeParent,
  appendChildNode,
  updateNestedNodeTrail,
  getTreeNodePath,
  containsNestedTreeNodeById,
  getTreeNodeAncestors,
  EMPTY_OBJECT,
  getTreeNodeFromPath,
  getNestedTreeNodeById,
  replaceNestedNode,
  insertChildNode,
  removeNestedTreeNode,
  getTreeNodesByName
} from "tandem-common";
import { PCEditorState } from "./edit";
// import { SyntheticNode, PCNode, PCModule, PCComponent, DependencyGraph, PCComponentInstanceElement, PCSourceTagNames, PCOverride, PCChildrenOverride } from "paperclip";

// /**
//  * Inspector tree node combines source & synthetic nodes together
//  * for designing & debugging. This exists primarily because source nodes aren't
//  * the best representation for debugging (instances for instances have shadows, bindings, and other dynamic properties), and
//  * Synthetic nodes aren't the best representations either since they can be verbose (repeated items for example), and they don't map well
//  * back to their original source (slotted nodes for example are rendered to their slots, conditional elements may or may not exist).
//  */

export enum InspectorTreeNodeName {
  ROOT = "root",
  SOURCE_REP = "source-rep",
  SHADOW = "shadow",
  CONTENT = "content"
}

export type InspectorTreeBaseNode<TType extends InspectorTreeNodeName> = {
  expanded?: boolean;
  id: string;
  instancePath: string;
  alt?: boolean;

  // May not exist in some cases like plugs
  sourceNodeId: null | string;
  children: InspectorTreeBaseNode<any>[];
} & TreeNode<TType>;

export type InspectorRoot = {} & InspectorTreeBaseNode<
  InspectorTreeNodeName.ROOT
>;

export type InspectorSourceRep = {} & InspectorTreeBaseNode<
  InspectorTreeNodeName.SOURCE_REP
>;

export type InspectorShadow = {} & InspectorTreeBaseNode<
  InspectorTreeNodeName.SHADOW
>;

export type InspectorContent = {
  // must exist
  sourceSlotNodeId: string;
} & InspectorTreeBaseNode<InspectorTreeNodeName.CONTENT>;

export type InspectorNode =
  | InspectorRoot
  | InspectorSourceRep
  | InspectorShadow
  | InspectorContent;

export const createRootInspectorNode = (): InspectorRoot => ({
  id: generateUID(),
  name: InspectorTreeNodeName.ROOT,
  children: EMPTY_ARRAY,
  expanded: true,
  instancePath: null,
  sourceNodeId: null
});

const createInspectorSourceRep = (
  assocSourceNode: PCNode,
  instancePath: string = null,
  expanded: boolean = false,
  children?: InspectorNode[]
): InspectorSourceRep => ({
  id: generateUID(),
  name: InspectorTreeNodeName.SOURCE_REP,
  children: children || EMPTY_ARRAY,
  instancePath,
  expanded,
  sourceNodeId: assocSourceNode.id
});

const createInspectorShadow = (
  assocSourceNode: PCComponent,
  instancePath: string,
  expanded: boolean = false,
  children?: InspectorNode[]
): InspectorShadow => ({
  id: generateUID(),
  name: InspectorTreeNodeName.SHADOW,
  children: children || EMPTY_ARRAY,
  instancePath,
  expanded,
  sourceNodeId: assocSourceNode.id
});

const createInstanceContent = (
  sourceSlotNodeId: string,
  instancePath: string,
  sourceNodeId: string = null,
  expanded: boolean = false,
  children?: InspectorNode[]
): InspectorContent => ({
  id: generateUID(),
  name: InspectorTreeNodeName.CONTENT,
  children: children || EMPTY_ARRAY,
  instancePath,
  expanded,
  sourceSlotNodeId: sourceSlotNodeId,
  sourceNodeId
});

export const evaluateModuleInspector = (
  module: PCModule,
  graph: DependencyGraph,
  sourceMap: KeyValue<string[]> = {}
): [InspectorNode, KeyValue<string[]>] => {
  let inspectorChildren: InspectorNode[];

  sourceMap = JSON.parse(JSON.stringify(sourceMap));

  inspectorChildren = evaluateInspectorNodeChildren(
    module,
    "",
    graph,
    false,
    sourceMap
  );

  let inspectorNode = createInspectorSourceRep(
    module,
    "",
    true,
    inspectorChildren
  );

  addSourceMap(inspectorNode, sourceMap);

  return [inspectorNode, sourceMap];
};

// note that we're mutating state here because immutable performance
// here is _abysmal_.
const addSourceMap = (
  inspectorNode: InspectorNode,
  map: KeyValue<string[]>
) => {
  if (!inspectorNode.sourceNodeId) {
    return map;
  }
  if (!map[inspectorNode.sourceNodeId]) {
    map[inspectorNode.sourceNodeId] = [];
  }

  map[inspectorNode.sourceNodeId].push(inspectorNode.id);

  return map;
};

const removeSourceMap = (
  inspectorNode: InspectorNode,
  map: KeyValue<string[]>
) => {
  const walk = (current: InspectorNode) => {
    if (!current.sourceNodeId) {
      return;
    }
    const index = map[current.sourceNodeId].indexOf(current.id);
    if (index !== -1) {
      map[current.sourceNodeId].splice(index, 1);
      if (map[current.sourceNodeId].length === 0) {
        map[current.sourceNodeId] = undefined;
      }
    }

    for (const child of current.children) {
      walk(child as InspectorNode);
    }
  };

  walk(inspectorNode);
};

const evaluateInspectorNodeChildren = (
  parent: PCNode,
  instancePath: string,
  graph: DependencyGraph,
  fromInstanceShadow: boolean = false,
  sourceMap: KeyValue<string[]>
): InspectorNode[] => {
  if (extendsComponent(parent)) {
    const component = getPCNode(
      (parent as PCComponent).is,
      graph
    ) as PCComponent;

    const shadowInstancePath =
      !fromInstanceShadow &&
      (parent.name === PCSourceTagNames.COMPONENT_INSTANCE ||
        getParentTreeNode(parent.id, getPCNodeModule(parent.id, graph)).name ===
          PCSourceTagNames.MODULE)
        ? addInstancePath(instancePath, parent)
        : instancePath;

    let shadowChildren: InspectorNode[];

    shadowChildren = evaluateInspectorNodeChildren(
      component,
      shadowInstancePath,
      graph,
      true,
      sourceMap
    );

    const shadow = createInspectorShadow(
      component,
      shadowInstancePath,
      false,
      shadowChildren
    );

    addSourceMap(shadow, sourceMap);

    let plugs: InspectorNode[];

    plugs = getComponentSlots(component).reduce(
      (plugs: InspectorNode[], slot): InspectorNode[] => {
        const plug = getSlotPlug(parent as PCComponent, slot);

        let inspectorChildren: InspectorNode[] = [];

        inspectorChildren = plug
          ? evaluateInspectorNodeChildren(
              plug,
              instancePath,
              graph,
              false,
              sourceMap
            )
          : EMPTY_ARRAY;
        const inspector = createInstanceContent(
          slot.id,
          instancePath,
          (plug && plug.id) || null,
          false,
          inspectorChildren
        );

        addSourceMap(inspector, sourceMap);

        return [...plugs, inspector];
      },
      EMPTY_ARRAY
    ) as InspectorNode[];

    const children = [shadow, ...plugs];

    return children;
  } else {
    const usablePCChildren = parent.children.filter(child => {
      return isVisibleNode(child) || isSlot(child) || isComponent(child);
    });

    return usablePCChildren.reduce((ret: InspectorNode[], child) => {
      let inspectorChildren: InspectorNode[];

      inspectorChildren = evaluateInspectorNodeChildren(
        child,
        instancePath,
        graph,
        false,
        sourceMap
      );

      const inspector = createInspectorSourceRep(
        child,
        instancePath,
        false,
        inspectorChildren
      );

      addSourceMap(inspector, sourceMap);

      return [...ret, inspector];
    }, EMPTY_ARRAY) as InspectorNode[];
  }
};

export const isInspectorNode = (node: TreeNode<any>): node is InspectorNode => {
  return (
    node.name === InspectorTreeNodeName.SOURCE_REP ||
    node.name === InspectorTreeNodeName.CONTENT ||
    node.name === InspectorTreeNodeName.SHADOW
  );
};

export const refreshInspectorTree = (
  root: InspectorTreeBaseNode<any>,
  newGraph: DependencyGraph,
  moduleUris: string[],
  sourceMap: KeyValue<string[]> = EMPTY_OBJECT,
  oldGraph: DependencyGraph = EMPTY_OBJECT
): [InspectorNode, KeyValue<string[]>] => {
  let newSourceMap: KeyValue<string[]> = JSON.parse(JSON.stringify(sourceMap));

  let moduleChildren: InspectorNode[] = [];

  // 1. remove source map info
  for (const moduleInspectorNode of root.children) {
    const dep = getPCNodeDependency(
      (moduleInspectorNode as InspectorNode).sourceNodeId,
      oldGraph
    );
    if (
      dep &&
      newSourceMap[dep.content.id] &&
      moduleUris.indexOf(dep.uri) !== -1
    ) {
      moduleChildren.push(moduleInspectorNode as InspectorNode);
    } else {
      removeSourceMap(moduleInspectorNode as InspectorNode, newSourceMap);
    }
  }

  root = {
    ...root,
    children: moduleChildren
  };

  // 2. patch trees based on moduleUris
  for (const uri of moduleUris) {
    const oldDependency = oldGraph[uri];
    const newDep = newGraph[uri];

    if (!newDep) {
      continue;
    }

    const newModule = newDep.content;
    if (!oldDependency || !sourceMap[oldDependency.content.id]) {
      let moduleInspector: InspectorNode;
      [moduleInspector, newSourceMap] = evaluateModuleInspector(
        newModule,
        newGraph,
        newSourceMap
      );
      root = appendChildNode(moduleInspector, root);
    } else {
      [root, newSourceMap] = patchInspectorTree2(
        root,
        newGraph,
        uri,
        newSourceMap,
        oldGraph
      );
    }
  }

  return [root, newSourceMap];
};

const isUnreppedSourceNode = (node: PCNode) =>
  node.name === PCSourceTagNames.VARIABLE ||
  node.name === PCSourceTagNames.VARIANT_TRIGGER ||
  node.name === PCSourceTagNames.QUERY ||
  node.name === PCSourceTagNames.OVERRIDE ||
  node.name === PCSourceTagNames.VARIANT;

const patchInspectorTree2 = (
  rootInspectorNode: InspectorTreeBaseNode<any>,
  newGraph: DependencyGraph,
  uri: string,
  sourceMap: KeyValue<string[]>,
  oldGraph: DependencyGraph
): [InspectorNode, KeyValue<string[]>] => {
  const newModule = newGraph[uri].content;
  const oldModule = oldGraph[uri].content;
  let tmpModule = oldModule;
  const now = Date.now();
  const ots = diffTreeNode(tmpModule, newModule);

  let newSourceMap = sourceMap;

  for (const ot of ots) {
    const targetNode = getTreeNodeFromPath(ot.nodePath, tmpModule) as PCNode;

    if (isUnreppedSourceNode(targetNode as PCNode)) {
      continue;
    }

    tmpModule = patchTreeNode([ot], tmpModule);
    const patchedTarget = getTreeNodeFromPath(ot.nodePath, tmpModule) as PCNode;

    const targetInspectorNodeInstanceIds = newSourceMap[patchedTarget.id];

    for (const inspectorNodeId of targetInspectorNodeInstanceIds) {
      const targetInspectorNode = getNestedTreeNodeById(
        inspectorNodeId,
        rootInspectorNode
      );
      let newInspectorNode = targetInspectorNode;
      const shadow =
        targetInspectorNode.name === InspectorTreeNodeName.SHADOW
          ? targetInspectorNode
          : getInspectorNodeParentShadow(
              targetInspectorNode,
              rootInspectorNode
            );
      switch (ot.type) {
        case TreeNodeOperationalTransformType.INSERT_CHILD: {
          const { child } = ot;
          const pcChild = child as PCNode;
          const reppedChildren = patchedTarget.children.filter(
            child => !isUnreppedSourceNode(child)
          );
          let reppedIndex = reppedChildren.indexOf(pcChild);

          // maybe an unrepped node, so ignore
          if (reppedIndex === -1) {
            break;
          }

          let inspectorChildren;
          let newInspectorChild: InspectorNode;
          inspectorChildren = evaluateInspectorNodeChildren(
            pcChild,
            targetInspectorNode.instancePath,
            newGraph,
            Boolean(shadow),
            newSourceMap
          );

          if (pcChild.name === PCSourceTagNames.PLUG) {
            const existingInspectorPlug = targetInspectorNode.children.find(
              (child: InspectorNode) =>
                child.name === InspectorTreeNodeName.CONTENT &&
                child.sourceSlotNodeId === pcChild.slotId
            );

            newInspectorNode = removeNestedTreeNode(
              existingInspectorPlug,
              newInspectorNode
            );
            removeSourceMap(existingInspectorPlug, newSourceMap);
            newInspectorChild = createInstanceContent(
              pcChild.slotId,
              targetInspectorNode.instancePath,
              pcChild.id,
              false,
              inspectorChildren
            );

            // need to increment index by 1 to ensure that the child is
            // inserted _after_ the shadow inspector node.
            reppedIndex++;
          } else {
            newInspectorChild = createInspectorSourceRep(
              pcChild,
              targetInspectorNode.instancePath,
              false,
              inspectorChildren
            );
          }

          newInspectorNode = insertChildNode(
            newInspectorChild,
            reppedIndex,
            newInspectorNode
          );
          addSourceMap(newInspectorChild, newSourceMap);

          // if the child is a slot, then add virtual content nodes ONLY for
          // instances
          if (pcChild.name === PCSourceTagNames.SLOT && shadow) {
            // component is _always_ a contentNode
            const component = getPCNodeContentNode(
              pcChild.id,
              getPCNodeModule(pcChild.id, newGraph)
            );

            const componentSlots = getTreeNodesByName(
              PCSourceTagNames.SLOT,
              component
            );
            const insertIndex = componentSlots.findIndex(
              child => child.id === pcChild.id
            );

            const instanceInspectorNode = getParentTreeNode(
              shadow.id,
              rootInspectorNode
            ) as InspectorNode;

            const virtualPlug = createInstanceContent(
              pcChild.id,
              instanceInspectorNode.instancePath
            );

            // insert index + 1 to bypass shadow
            const newInspectorNode = insertChildNode(
              virtualPlug,
              insertIndex + 1,
              instanceInspectorNode
            );
            rootInspectorNode = replaceNestedNode(
              newInspectorNode,
              newInspectorNode.id,
              rootInspectorNode
            );
          }

          break;
        }
        case TreeNodeOperationalTransformType.REMOVE_CHILD: {
          const { index } = ot;
          const pcChild = targetNode.children[index] as PCNode;
          const inspectorChild = newInspectorNode.children.find(child => {
            return child.sourceNodeId === pcChild.id;
          });

          if (!inspectorChild) {
            break;
          }

          const inspectorChildIndex = newInspectorNode.children.indexOf(
            inspectorChild
          );

          newInspectorNode = removeNestedTreeNode(
            inspectorChild,
            newInspectorNode
          );
          removeSourceMap(inspectorChild, newSourceMap);

          if (inspectorChild.name === InspectorTreeNodeName.CONTENT) {
            const placeholderInspectorNode = createInstanceContent(
              (inspectorChild as InspectorContent).sourceSlotNodeId,
              newInspectorNode.instancePath
            );
            newInspectorNode = insertChildNode(
              placeholderInspectorNode,
              inspectorChildIndex,
              newInspectorNode
            );
            addSourceMap(placeholderInspectorNode, newSourceMap);
          }

          break;
        }
        case TreeNodeOperationalTransformType.MOVE_CHILD: {
          const { oldIndex, newIndex } = ot;
          const pcChild = targetNode.children[oldIndex] as PCNode;
          const beforeChild = targetNode.children[newIndex] as PCNode;

          const inspectorChild = newInspectorNode.children.find(child => {
            return child.sourceNodeId === pcChild.id;
          });

          const beforeInspectorChildIndex = beforeChild
            ? newInspectorNode.children.findIndex(child => {
                return child.sourceNodeId === beforeChild.id;
              })
            : newInspectorNode.children.length;

          if (!inspectorChild || beforeInspectorChildIndex === -1) {
            break;
          }

          newInspectorNode = removeNestedTreeNode(
            inspectorChild,
            newInspectorNode
          );

          newInspectorNode = insertChildNode(
            inspectorChild,
            beforeInspectorChildIndex,
            newInspectorNode
          );

          break;
        }
        case TreeNodeOperationalTransformType.SET_PROPERTY: {
          const { name, value } = ot;

          // instance type change, so we need to replace all current children with appropriate shadow & plugs
          if (
            (patchedTarget.name === PCSourceTagNames.COMPONENT_INSTANCE &&
              name === "is") ||
            (name === "name" && value === "component-instance")
          ) {
            for (const child of newInspectorNode.children) {
              newInspectorNode = removeNestedTreeNode(child, newInspectorNode);
              removeSourceMap(child as InspectorNode, newSourceMap);
            }
            const newChildren = evaluateInspectorNodeChildren(
              patchedTarget,
              targetInspectorNode.instancePath,
              newGraph,
              Boolean(shadow),
              newSourceMap
            );
            newInspectorNode = {
              ...newInspectorNode,
              children: newChildren
            };
          }

          break;
        }
      }

      if (targetInspectorNode !== newInspectorNode) {
        rootInspectorNode = replaceNestedNode(
          newInspectorNode,
          targetInspectorNode.id,
          rootInspectorNode
        );
      }
    }
  }

  return [rootInspectorNode, newSourceMap];
};

export const getInspectorNodeSyntheticDocument = (
  node: InspectorNode,
  ancestor: InspectorNode,
  graph: DependencyGraph,
  documents: SyntheticDocument[]
) => {
  const sourceNode = getInspectorSourceNode(node, ancestor, graph);
  if (!sourceNode) {
    return null;
  }
  const dependency = getPCNodeDependency(sourceNode.id, graph);
  return getSyntheticDocumentByDependencyUri(dependency.uri, documents, graph);
};

export const getInspectorSourceNode = (
  node: InspectorNode,
  ancestor: InspectorNode,
  graph: DependencyGraph
): PCNode | null => {
  if (node.name === InspectorTreeNodeName.CONTENT) {
    const nodeSource = getPCNode(node.sourceSlotNodeId, graph);
    const parent = getParentTreeNode(node.id, ancestor) as InspectorNode;
    return getSlotPlug(
      getPCNode(parent.sourceNodeId, graph) as PCComponentInstanceElement,
      nodeSource as PCSlot
    );
  } else {
    return getPCNode(node.sourceNodeId, graph);
  }
};

export type InstanceVariantInfo = {
  enabled: boolean;
  variant: PCVariant;
  component: PCComponent;
};

export const getInstanceVariantInfo = memoize(
  (
    node: InspectorNode,
    root: InspectorNode,
    graph: DependencyGraph,
    selectedVariantId?: string
  ): InstanceVariantInfo[] => {
    const instance = getInspectorSourceNode(
      node,
      root,
      graph
    ) as PCComponentInstanceElement;
    const component = getPCNode(instance.is, graph) as PCComponent;
    const variants = getPCVariants(component);

    const parentNodes = [
      node,
      ...getTreeNodeAncestors(node.id, root)
    ] as InspectorNode[];

    const enabled: KeyValue<boolean> = {};

    for (const parentNode of parentNodes) {
      const parentSourceNode = getPCNode(parentNode.sourceNodeId, graph);
      if (!parentSourceNode) {
        continue;
      }
      const variant =
        parentSourceNode.name === PCSourceTagNames.COMPONENT ||
        parentSourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE
          ? parentSourceNode.variant
          : EMPTY_OBJECT;
      const variantOverride = parentSourceNode.children.find(
        (child: PCNode) =>
          child.name === PCSourceTagNames.OVERRIDE &&
          child.propertyName === PCOverridablePropertyName.VARIANT &&
          (last(child.targetIdPath) === instance.id ||
            (child.targetIdPath.length === 0 &&
              parentSourceNode.id === instance.id)) &&
          child.variantId == selectedVariantId
      ) as PCBaseValueOverride<any, any>;
      Object.assign(enabled, variant, variantOverride && variantOverride.value);
    }

    return variants.map(variant => ({
      variant,
      component,
      enabled: enabled[variant.id]
    }));
  }
);
export const inspectorNodeInShadow = (
  node: InspectorNode,
  contentNode: InspectorNode
) => {
  return Boolean(
    findTreeNodeParent(
      node.id,
      contentNode,
      parent => parent.name === InspectorTreeNodeName.SHADOW
    )
  );
};

export const getInspectorNodeOwnerInstance = (
  node: InspectorNode,
  root: InspectorNode
) => {
  return findTreeNodeParent(
    node.id,
    root,
    (parent: InspectorNode) =>
      !inspectorNodeInShadow(parent, root) &&
      parent.name === InspectorTreeNodeName.SOURCE_REP
  );
};

const getInspectorNodeOwnerSlot = (
  node: InspectorNode,
  root: InspectorNode,
  graph: DependencyGraph
) => {
  return findTreeNodeParent(
    node.id,
    root,
    (parent: InspectorNode) =>
      getPCNode(parent.sourceNodeId, graph) &&
      getPCNode(parent.sourceNodeId, graph).name === PCSourceTagNames.SLOT
  );
};

export const getTopMostInspectorInstance = (
  current: InspectorNode,
  root: InspectorNode
) => {
  while (
    inspectorNodeInShadow(current, root) ||
    current.name === InspectorTreeNodeName.SHADOW
  ) {
    current = getParentTreeNode(current.id, root) as InspectorNode;
  }

  return current;
};

export const getInsertableInspectorNode = (
  child: InspectorNode,
  root: InspectorNode,
  graph: DependencyGraph
) => {
  if (inspectorNodeInShadow(child, root)) {
    const slot = getInspectorNodeOwnerSlot(child, root, graph);
    return slot;
  } else {
    return child;
  }
};

/**
 * Used primarily to check for circular references
 */

export const inspectorNodeInInstanceOfComponent = (
  componentId: string,
  inspectorNode: InspectorNode,
  root: InspectorNode
) => {
  return [inspectorNode, ...getTreeNodeAncestors(inspectorNode.id, root)].some(
    (parent: InspectorNode) => {
      return (
        parent.name === InspectorTreeNodeName.SOURCE_REP &&
        parent.sourceNodeId === componentId
      );
    }
  );
};

export const expandInspectorNode = (
  node: InspectorNode,
  root: InspectorNode
) => {
  if (node.expanded) {
    return root;
  }

  return updateNestedNode(node, root, node => {
    return {
      ...node,
      expanded: true
    };
  });
};

export const expandSyntheticInspectorNode = (
  node: SyntheticNode,
  document: SyntheticDocument,
  rootInspectorNode: InspectorNode,
  graph: DependencyGraph
) => {
  const instancePath = getSyntheticInstancePath(node, document, graph).join(
    "."
  );
  const sourceNodeId = node.sourceNodeId;

  const relatedInspectorNode = flattenTreeNode(rootInspectorNode).find(
    child =>
      child.instancePath === instancePath && child.sourceNodeId === sourceNodeId
  );

  if (!relatedInspectorNode) {
    console.error(`Inspector node ${instancePath}.${sourceNodeId} not found`);
    return rootInspectorNode;
  }

  rootInspectorNode = expandInspectorNodeById(
    relatedInspectorNode.id,
    rootInspectorNode
  );

  return rootInspectorNode;
};

export const expandInspectorNodeById = (
  id: string,
  rootInspectorNode: InspectorNode
) => {
  return updateNestedNodeTrail(
    getTreeNodePath(id, rootInspectorNode),
    rootInspectorNode,
    (node: InspectorNode) => {
      return {
        ...node,
        expanded: true
      };
    }
  );
};

export const getInheritedOverridesOverrides = (
  inspectorNode: InspectorNode,
  rootInspectorNode: InspectorNode,
  graph: DependencyGraph
) => {
  if (!inspectorNode.sourceNodeId) {
    return null;
  }
  const sourceNode = getPCNode(inspectorNode.sourceNodeId, graph);
  let overrides: PCOverride[] = getOverrides(sourceNode);
  const parent = getParentTreeNode(
    inspectorNode.id,
    rootInspectorNode
  ) as InspectorNode;
  if (parent && parent.sourceNodeId) {
    overrides = [
      ...overrides,
      ...getInheritedOverridesOverrides(parent, rootInspectorNode, graph)
    ];
  }
  return overrides;
};

// TODO - move to paperclip
export const getInspectorNodeOverrides = memoize(
  (
    inspectorNode: InspectorNode,
    rootInspectorNode: InspectorNode,
    variant: PCVariant,
    graph: DependencyGraph
  ) => {
    let overrides: PCOverride[] = [];
    if (!inspectorNode.sourceNodeId) {
      return overrides;
    }
    const sourceNode = getPCNode(inspectorNode.sourceNodeId, graph);
    const inheritedOverrides = getInheritedOverridesOverrides(
      inspectorNode,
      rootInspectorNode,
      graph
    );
    for (const override of inheritedOverrides) {
      const overrideModule = getPCNodeModule(override.id, graph);
      const matchesVariant =
        !override.variantId || override.variantId == (variant && variant.id);
      const overrideIsTarget =
        last(override.targetIdPath) === inspectorNode.sourceNodeId;
      const overrideTargetIsParent =
        override.targetIdPath.length === 0 &&
        getParentTreeNode(override.id, overrideModule).id === sourceNode.id;

      if (matchesVariant && (overrideIsTarget || overrideTargetIsParent)) {
        overrides.push(override);
      }
    }
    return overrides;
  }
);

export const getSyntheticNodeInspectorNode = <TState extends PCEditorState>(
  node: SyntheticNode,
  state: TState
) => {
  const sourceNode = getSyntheticSourceNode(node, state.graph);
  return flattenTreeNode(state.sourceNodeInspector).find(
    child => child.sourceNodeId === sourceNode.id
  );
};

export const getInspectorNodeBySourceNodeId = <TState extends PCEditorState>(
  sourceNodeId: string,
  root: InspectorNode
) => {
  return flattenTreeNode(root).find(
    child => !child.instancePath && child.sourceNodeId === sourceNodeId
  );
};

export const getInspectorContentNodeContainingChild = memoize(
  (child: InspectorNode, root: InspectorNode) => {
    for (let i = 0, n1 = root.children.length; i < n1; i++) {
      const module = root.children[i];
      for (let j = 0, n2 = module.children.length; j < n2; j++) {
        const contentNode = module.children[j];
        if (
          contentNode.id !== child.id &&
          containsNestedTreeNodeById(child.id, contentNode)
        ) {
          return contentNode;
        }
      }
    }
  }
);

export const getInspectorContentNode = memoize(
  (node: InspectorNode, root: InspectorNode) => {
    return getInspectorContentNodeContainingChild(node, root) || node;
  }
);

export const getInspectorInstanceShadow = memoize(
  (inspectorNode: InspectorNode) => {
    return inspectorNode.children[0];
  }
);

export const getInspectorInstanceShadowContentNode = (
  inspectorNode: InspectorNode
) => {
  const shadow = getInspectorInstanceShadow(inspectorNode);
  return shadow && shadow.children[0];
};

export const getInspectorNodeParentShadow = memoize(
  (inspectorNode: InspectorNode, root: InspectorNode) => {
    let current: InspectorNode = inspectorNode;
    while (current) {
      const parent = getParentTreeNode(current.id, root) as InspectorNode;
      if (parent && parent.name === InspectorTreeNodeName.SHADOW) {
        return parent;
      }
      current = parent;
    }
    return null;
  }
);

export const getSyntheticInspectorNode = memoize(
  (
    node: SyntheticNode,
    document: SyntheticDocument,
    rootInspector: InspectorNode,
    graph: DependencyGraph
  ) => {
    const instancePath = getSyntheticInstancePath(node, document, graph).join(
      "."
    );

    return flattenTreeNode(rootInspector).find(
      (child: InspectorTreeBaseNode<any>) => {
        return (
          child.name === InspectorTreeNodeName.SOURCE_REP,
          child.instancePath === instancePath &&
            child.sourceNodeId === node.sourceNodeId
        );
      }
    );
  }
);

export const getInspectorSyntheticNode = memoize(
  (
    node: InspectorNode,
    documents: SyntheticDocument[]
  ): SyntheticVisibleNode => {
    const instancePath = node.instancePath;
    const nodePath =
      (node.instancePath ? instancePath + "." : "") + node.sourceNodeId;

    const sourceMap = getSyntheticDocumentsSourceMap(documents);

    // doesn't exist for root, shadows, or content nodes
    const syntheticNodeId = sourceMap[nodePath];

    return syntheticNodeId && getSyntheticNodeById(syntheticNodeId, documents);
  }
);

const addInstancePath = (instancePath: string, parentAssocNode: PCNode) => {
  return (instancePath || "") + (instancePath ? "." : "") + parentAssocNode.id;
};

export const collapseInspectorNode = (
  node: InspectorNode,
  root: InspectorNode
) => {
  if (!node.expanded) {
    return node;
  }

  const collapse = (node: InspectorNode) => {
    if (!node.expanded) {
      return node;
    }
    return {
      ...node,
      expanded: false,
      children: node.children.map(collapse)
    };
  };

  return updateNestedNode(node, root, collapse);
};

/*

Considerations:

- components
- slots
- plugs

To ignore:

- overrides


*/
