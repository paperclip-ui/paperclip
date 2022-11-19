import * as fs from "fs";
import * as chalk from "chalk";
import * as path from "path";
import { CONFIG_FILE_NAME } from "./constants";
import { memoize } from "./memo";
import { camelCase, kebabCase, pick } from "lodash";
import { logError, pascalCase } from "./utils";
import { getLayerStyle } from "./translate/context";

export type AtomsConfig = {
  globalVars?: boolean;
  typePrefix?: boolean;
  prefix?: string;
};

export type Config = {
  // project urls
  sources: string[];

  namespace?: string;

  // pc files to include
  inject?: string[];

  exclude?: ExcludeRule[];
  atoms?: AtomsConfig;

  outputDir: string;
};

export type ExcludeRule = {
  pattern: RegExp;
};

// _7113_testB3_testA24

export const cleanLabel = (name: string) => {
  // remove emojis
  return name.replace(/[^a-zA-Z0-9\-\_\s]/g, "");
};

const MAX_LABEL_NAME_LENGTH = 40;

export type FileConfig = {
  key: string;
  version?: string;
};

export type CompilerOptions = {
  componentsOnly?: boolean;
  includeAbsoluteLayout?: boolean;
  includePreviews?: boolean;
};

export enum DesignFileImportKind {
  Font = "Font",
  Design = "Design",
}

export type BaseDesignFileImport<TKind = DesignFileImportKind> = {
  kind: TKind;
  fileKey: string;
};

export type DesignFileFontImport =
  BaseDesignFileImport<DesignFileImportKind.Font>;

export type DesignFileDesignImport =
  BaseDesignFileImport<DesignFileImportKind.Design> & {
    nodeId: string;
  };

export type DesignFileImport = DesignFileDesignImport | DesignFileFontImport;

export type Point = { x: number; y: number };

export enum DependencyKind {
  Font,
  Design,
  Media,
}

export type BaseDependency<TKind extends DependencyKind> = {
  kind: TKind;
  fileKey: string;
};

export type DesignDependency = {
  name: string;
  fileKey: string;
  imports: Record<string, DesignFileImport>;
  document: Document;
  styles: any;
} & BaseDependency<DependencyKind.Design>;

export type FontDependency = {
  content: string;
} & BaseDependency<DependencyKind.Font>;
export type MediaDependency = {
  url: string;
  nodeId: any;
  settings: ExportSettings;
} & BaseDependency<DependencyKind.Media>;

export type Dependency = FontDependency | DesignDependency | MediaDependency;

export type DependencyGraph = Record<string, Dependency>;

export enum OutputFileKind {
  Buffer,
  Remote,
}

export type BaseOutputFile<TKind extends OutputFileKind> = {
  relativePath: string;
  kind: TKind;
};

export type BufferOutputFile = {
  content: string;
} & BaseOutputFile<OutputFileKind.Buffer>;

export type RemoteOutputFile = {
  url: string;
} & BaseOutputFile<OutputFileKind.Remote>;

export type OutputFile = BufferOutputFile | RemoteOutputFile;

export type Project = {
  id: number;
  name: string;
  files: ProjectFile[];
};

export type ProjectFile = {
  key: string;
  name: string;
};

export enum FileNameFormat {
  Preserve = "preserve",
  CamelCase = "camel-case",
  PascalCase = "pascal-case",
  SnakeCase = "snake-case",
  KebabCase = "kebab-case",
}

// based on https://www.figma.com/developers/api
export enum NodeType {
  Document = "DOCUMENT",
  Rectangle = "RECTANGLE",
  Ellipse = "ELLIPSE",
  Star = "STAR",
  REGULAR_POLYGON = "REGULAR_POLYGON",
  Line = "LINE",
  Canvas = "CANVAS",
  Group = "GROUP",
  Frame = "FRAME",
  Vector = "VECTOR",
  Instance = "INSTANCE",
  Component = "COMPONENT",
  ComponentSet = "COMPONENT_SET",
  Text = "TEXT",
}

export type BaseNode<TType extends string> = {
  id: string;
  name: string;
  type: TType;
};

export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type Paint = {
  blendMode: string;
  type: string;
  color: Color;
};

export type LayoutConstraint = {};
export type EasingType = {};
export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type Effect = any;
export type Vector = { x: number; y: number };
export type Transform = [number, number, number][];
export type Path = {
  path: string;
};
export type StyleType = "FILL" | "TEXT" | "EFFECT" | "GRID";

export type Constraint = {
  type: "SCALE" | "WIDTH" | "HEIGHT";
  value: number;
};

export type ExportSettings = {
  suffix: string;
  format: string;
  constraint: Constraint;
};

export const FRAME_EXPORT_SETTINGS: ExportSettings = {
  suffix: null,
  format: "png",
  constraint: {
    type: "SCALE",
    value: 3,
  },
};

export const DEFAULT_SHAPE_EXPORT_SETTINGS: ExportSettings = {
  suffix: null,
  format: "svg",
  constraint: {
    type: "SCALE",
    value: 1,
  },
};

export enum FillType {
  SOLID = "SOLID",
  GRADIENT_LINEAR = "GRADIENT_LINEAR",
  GRADIENT_RADIAL = "GRADIENT_RADIAL",
  GRADIENT_ANGULAR = "GRADIENT_ANGULAR",
  DIAMOND_GRADIENT = "DIAMOND_GRADIENT",
  IMAGE = "IMAGE",
}

type BaseFill<TType extends FillType> = {
  visible?: boolean;
  blendMode: string;
  type: TType;
};

export type SolidFill = {
  blendMode: string;
  color: Color;
} & BaseFill<FillType.SOLID>;

export type ImageFill = {
  blendMode: string;
  scaleMode: string;
  imageRef: string;
} & BaseFill<FillType.IMAGE>;

export type GradientStop = {
  color: Color;
  position: number;
};

export type LinearGradient = {
  gradientHandlePositions: Vector[];
  gradientStops: GradientStop[];
} & BaseFill<FillType.GRADIENT_LINEAR>;

export type RadialGradient = {
  gradientHandlePositions: Vector[];
  gradientStops: GradientStop[];
} & BaseFill<FillType.GRADIENT_RADIAL>;

export type AngularGradient = {
  gradientHandlePositions: Vector[];
  gradientStops: GradientStop[];
} & BaseFill<FillType.GRADIENT_ANGULAR>;

export type DiamondGradient = {
  gradientHandlePositions: Vector[];
  gradientStops: GradientStop[];
} & BaseFill<FillType.DIAMOND_GRADIENT>;

export type Fill =
  | SolidFill
  | LinearGradient
  | RadialGradient
  | AngularGradient
  | DiamondGradient
  | ImageFill;

export type VectorNodeProps = {
  locked: boolean;
  blendMode: string;
  preserveRatio: boolean;
  exportSettings?: ExportSettings[];
  layoutAlign: "MIN" | "CENTER" | "MAX" | "STRETCH";
  constraints: LayoutConstraint;
  transitionNodeID?: string;
  transitionDuration?: number;
  transitionEasing?: EasingType;
  opacity: number;
  absoluteBoundingBox: Rectangle;
  effects: Effect[];
  size: Vector;
  relativeTransform: Transform;
  isMask: boolean;
  fills: Fill[];
  fillGeometry: Path[];
  strokes: Fill[];
  strokeWeight: number;
  strokeCap: string;
  strokeJoin: string;
  strokeDashes: number[];
  strokeMiterAngle: number[];
  strokeGeometry: Path[];
  strokeAlign: string;
  styles: Record<StyleType, String>;
};

export type Document = {
  children: Node[];
} & BaseNode<NodeType.Document>;

export type Canvas = {
  backgroundColor: Color;
  exportSettings: ExportSettings[];
  children: Node[];
} & BaseNode<NodeType.Canvas>;

export type Text = {
  characters: string;
  style: Record<string, string | number>;
} & VectorNodeProps &
  BaseNode<NodeType.Text>;

export type GroupNode = {
  children: Node[];
} & VectorNodeProps &
  BaseNode<NodeType.Group>;

export type VectorNode = {} & VectorNodeProps & BaseNode<NodeType.Vector>;

export type RectangleNode = {
  cornerRadius: number;
  rectangleCornerRadii: number[];
} & VectorNodeProps &
  BaseNode<NodeType.Rectangle>;

export type EllipseNode = {} & VectorNodeProps & BaseNode<NodeType.Ellipse>;
export type StarNode = {} & VectorNodeProps & BaseNode<NodeType.Star>;
export type RegularPolygonNode = {} & VectorNodeProps &
  BaseNode<NodeType.REGULAR_POLYGON>;

export type LineNode = {} & VectorNodeProps & BaseNode<NodeType.Line>;

export type FrameProps = {
  children: Node[];
  clipsContent: boolean;
} & VectorNodeProps;

export type Frame = FrameProps & BaseNode<NodeType.Frame>;

export type Instance = {
  componentId: string;
} & FrameProps &
  BaseNode<NodeType.Instance>;

export type ComponentSet = {} & FrameProps & BaseNode<NodeType.ComponentSet>;

export type Component = {} & FrameProps & BaseNode<NodeType.Component>;

export type VectorLikeNode = VectorNode | EllipseNode | StarNode;
export type Exportable = Frame | VectorNode | RectangleNode;
export type Parent = Frame | GroupNode | Document | Canvas | Instance;
export type Node =
  | Document
  | Canvas
  | GroupNode
  | Frame
  | VectorNode
  | RectangleNode
  | RegularPolygonNode
  | StarNode
  | EllipseNode
  | LineNode
  | Instance
  | Text
  | Component
  | ComponentSet;

export const hasVectorProps = (node: Node): node is VectorLikeNode => {
  return (
    node.type === NodeType.Frame ||
    node.type == NodeType.Rectangle ||
    node.type == NodeType.Vector ||
    node.type == NodeType.Instance ||
    node.type == NodeType.Component
  );
};

export const isExported = (node: Node): node is Exportable => {
  return (
    node?.type !== NodeType.Document &&
    node?.exportSettings?.length > 0 &&
    (node as any).visible !== false
  );
};

export const shouldExport = (node: Node) => {
  return (
    (node as any).visible !== false &&
    (isExported(node) || node.type === "COMPONENT")
  );
};

export const isVectorLike = (node: Node): node is VectorLikeNode => {
  return (
    node.type === NodeType.Vector ||
    node.type == NodeType.Star ||
    node.type == NodeType.Ellipse
  );
};

export const readConfigSync = (cwd: string) =>
  JSON.parse(fs.readFileSync(path.join(cwd, CONFIG_FILE_NAME), "utf8"));

export const flattenNodes = memoize((node: Node): Node[] => {
  const treeNodeMap = getTreeNodeIdMap(node);
  return Object.values(treeNodeMap) as Node[];
});

export const getNodeById = memoize(
  (nodeId: string, document: Document): Node => {
    const d = Date.now();
    const map = getTreeNodeIdMap(document);
    return map[nodeId];
  }
);

export const containsNode = memoize((node: Node, parent: Node): boolean => {
  return flattenNodes(parent).indexOf(node) !== -1;
});

export const getAllTextNodes = memoize((parent: Node): Text[] => {
  return flattenNodes(parent).filter(
    (node) => node.type === NodeType.Text
  ) as Text[];
}) as (parent: Node) => Text[];

export const hasChildren = (node: Node): node is Parent => {
  return (node as any).children?.length > 0;
};

export const getCleanedName = (name: string) => {
  // remove certain chars
  let newName = kebabCase(
    name.replace(/[\\/\-\s]/g, "_").replace(/[^_\w\d]/g, "")
  );
  newName = exceedsMaxLabelName(newName)
    ? newName.substr(0, MAX_LABEL_NAME_LENGTH)
    : newName;

  return kebabCase(newName);
};
const exceedsMaxLabelName = (name: string) =>
  name.length > MAX_LABEL_NAME_LENGTH;

export const getNodeExportFileName = (
  node: Node,
  document: Document,
  settings: ExportSettings
) => {
  if (!containsNode(node, document)) {
    throw new Error(`document doesn't contain node`);
  }

  // want to include document name to make sure that there's no clashing between assets
  return `${getCleanedName(node.name)}@${
    settings.constraint.value
  }.${settings.format.toLowerCase()}`;
};

export const getOriginalNode = (nodeId: string, document: Document) => {
  return getNodeById(nodeId.split(";").pop().replace("I", ""), document);
};

const flattenComponentNodes = memoize((document: Document) => {
  const allChildren = [];
  for (const component of getAllComponents(document)) {
    allChildren.push(...flattenNodes(component));
  }
  return allChildren;
});
//
export const getUniqueNodeName = (node: Node, document: Document) => {
  // Note that it's tempting to use a prettier name for assets, such as the _actual_ label, but we
  // don't want to allow designers to accidentally change assets out from underneath us. Keeping the ID within the
  // label itself is a bit more defensive.
  return getCleanedName(node.name) + "-" + kebabCase(node.id);
};

export const getNodePath = memoize((node: Node, root: Node | Document) => {
  const childParentMap = getChildParentMap(root);
  const idMap = getTreeNodeIdMap(root);
  let current = idMap[node.id];
  const path: number[] = [];
  while (1) {
    const parent = childParentMap[current.id];
    if (!parent) break;
    const i = (parent as any).children.indexOf(current);
    path.unshift(i);
    current = parent;
  }

  return path;
});

export const getNodeByPath = (path: number[], root: any) => {
  let curr = root;
  for (let i = 0, { length } = path; i < length; i++) {
    curr = curr.children[path[i]];
    if (!curr || !curr.children) {
      break;
    }
  }
  return curr;
};

export const getNodePage = (nodeId: string, document: Document) => {
  for (const page of document.children) {
    if (containsNode(getNodeById(nodeId, document), page)) {
      return page;
    }
  }
  return null;
};

export const getOwnerComponent = (node: Node, document: Document) => {
  if (node.type === NodeType.Component) {
    return null;
  }
  const ancestors = getNodeAncestors(node, document);
  for (const ancestor of ancestors) {
    if (ancestor.type === NodeType.Component) {
      return ancestor;
    }
  }
  return null;
};

export const getOwnerInstance = (node: Node, document: Document) => {
  if (node.type === NodeType.Instance) {
    return null;
  }
  const ancestors = getNodeAncestors(node, document);
  for (const ancestor of ancestors) {
    if (ancestor.type === NodeType.Instance) {
      return ancestor;
    }
  }
  return null;
};

export const getMixin = memoize(
  (mixinId: string, dep: DesignDependency, graph: DependencyGraph) => {
    let mixin;
    const imp = dep.imports[mixinId] as DesignFileDesignImport;

    if (imp) {
      mixin = (graph[imp.fileKey] as DesignDependency).styles[imp.nodeId];
    } else {
      mixin = dep.styles[mixinId];
    }

    return mixin;
  }
);

export const getInstanceComponent = (
  node: any,
  fileKey: string,
  graph: DependencyGraph
) => {
  const dep = graph[fileKey];

  if (dep.kind !== DependencyKind.Design) {
    return null;
  }

  if (node.type === "COMPONENT_SET") {
    return node;
  }

  if (node.type === "COMPONENT") {
    // const parent = getNodeParent(node, dep.document);
    // if (parent.type === "COMPONENT_SET") {
    //   return parent;
    // }
    return node;
  }

  let component;
  let componentDep;
  const imp = dep.imports[node.componentId] as any;

  if (imp) {
    componentDep = graph[imp.fileKey] as DesignDependency;
    component = getNodeById(imp.nodeId, componentDep.document);
  } else {
    componentDep = dep;
    component = getNodeById(node.componentId, dep.document);
  }

  if (component) {
    const parent = getNodeParent(component, componentDep.document);
    // if (parent.type === "COMPONENT_SET") {
    //   return parent;
    // } else {
    return component;
    // }
  }

  // TODO - look for instance
};

export const getComponentName = (componentOrSet: any) => {
  return pascalCase(componentOrSet.name);
};

export const cleanupNodeId = (nodeId: string) => nodeId.replace(/[:;]/g, "");

export const getNodeAncestors = (node: Node, document: Document): Node[] => {
  return filterTreeNodeParents(node, document, () => true);
};

export const getNodeFrame = (node: Node, document: Document): Frame => {
  const nodePath = getNodePath(node, document);
  let current: Parent = document;

  return getNodeByPath(nodePath.slice(0, 2), document);
};

export const getNodeDependency = memoize(
  (node: Node, graph: DependencyGraph) => {
    for (const fileKey in graph) {
      const dep = graph[fileKey];
      if (
        dep.kind === DependencyKind.Design &&
        containsNode(node, dep.document)
      ) {
        return dep;
      }
    }
  }
);

export const getNodeDependencyById = (
  nodeId: string,
  graph: DependencyGraph
): DesignDependency => {
  for (const fileKey in graph) {
    const dep = graph[fileKey];
    if (dep.kind !== DependencyKind.Design) {
      continue;
    }
    const node = getNodeById(nodeId, dep.document);
    if (node) {
      return dep;
    }
  }
};

export const filterTreeNodeParents = (
  node: Node,
  root: Node,
  filter: (node: Node) => boolean
) => {
  const parents: Node[] = [];
  const path = getNodePath(node, root);
  if (!path.length) return null;
  for (let i = path.length; i--; ) {
    const parent = getNodeByPath(path.slice(0, i), root);
    if (filter(parent)) {
      parents.push(parent);
    }
  }
  return parents;
};

export const getChildParentMap = memoize(
  (current: Node): Record<string, Node> => {
    const idMap = getTreeNodeIdMap(current);
    const parentChildMap: any = {};

    for (const id in idMap) {
      const parent = idMap[id];
      if ((parent as any).children) {
        for (const child of (parent as any).children) {
          parentChildMap[child.id] = parent;
        }
      }
    }
    return parentChildMap;
  }
);

export const getTreeNodeIdMap = memoize(
  (current: Node): Record<string, Node> => {
    const map = {
      [current.id]: current,
    };

    if ((current as any).children) {
      Object.assign(map, ...(current as any).children.map(getTreeNodeIdMap));
    }
    return map;
  }
);

export const getAllComponents = memoize((node: any) => {
  return flattenNodes(node).filter(
    (node) => node.type === NodeType.Component
  ) as Component[];
});

export const getAllComponentSets = memoize((document: Document) => {
  return flattenNodes(document).filter(
    (node) => node.type === NodeType.ComponentSet
  ) as ComponentSet[];
});

export const getNodeParent = memoize((node: Node, document: Document) => {
  return getChildParentMap(document)[node.id];
});

export const getMixinStyles = memoize(
  (mixinId: string, fileKey: string, graph: DependencyGraph) => {
    const dep = graph[fileKey];

    if (dep.kind !== DependencyKind.Design) {
      return null;
    }
    const imp = dep.imports[mixinId] as DesignFileDesignImport;
    const mixinDep = graph[imp?.fileKey || fileKey] as DesignDependency;
    const mixinNode = getNodeById(imp?.nodeId || mixinId, mixinDep.document);
  }
);

export const extractMixedInStyles = memoize(
  (layer: any): Record<string, any> => {
    const style = getLayerStyle(layer);
    const ret = {};
    for (const type in layer.styles) {
      const mixinId = layer.styles[type];
      if (type === "stroke" || type === "strokes") {
        ret[mixinId] = pick(style, "borderColor");
      } else if (type === "fill" || type === "fills") {
        ret[mixinId] = pick(style, "color", "background");
      } else if (type === "effect") {
        ret[mixinId] = pick(style, "boxShadow");
      } else if (type === "text") {
        ret[mixinId] = pick(
          style,
          "fontFamily",
          "letterSpacing",
          "lineHeight",
          "fontWeight",
          "fontSize",
          "textAlign"
        );
      }
    }

    return ret;
  }
);

export const getImports = memoize(
  (entry: Dependency, graph: DependencyGraph) => {
    const deps: Dependency[] = [];
    if (entry.kind === DependencyKind.Design) {
      for (const refId in entry.imports) {
        const imp = entry.imports[refId];
        deps.push(graph[imp.fileKey]);
      }
    }
    return deps;
  }
);
