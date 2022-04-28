import { ComputedDisplayInfo, Frame } from "./edit";
import { Action } from "redux";
import { DependencyGraph } from "./graph";
import { TreeNodeOperationalTransform } from "./ot";
import { KeyValue } from "tandem-common";
import { SyntheticDocument } from "./synthetic";

export const PC_SYNTHETIC_FRAME_RENDERED = "PC_SYNTHETIC_FRAME_RENDERED";
export const PC_DEPENDENCY_GRAPH_LOADED = "PC_DEPENDENCY_GRAPH_LOADED";
export const PC_SOURCE_FILE_URIS_RECEIVED = "PC_SOURCE_FILE_URIS_RECEIVED";
export const PC_SYNTHETIC_FRAME_CONTAINER_CREATED =
  "PC_SYNTHETIC_FRAME_CONTAINER_CREATED";
export const PC_RUNTIME_EVALUATED = "PC_RUNTIME_EVALUATED";

export type PCFrameContainerCreated = {
  frame: Frame;
  $container: HTMLElement;
} & Action;

export type PCSourceFileUrisReceived = {
  uris: string[];
} & Action;

export type PCFrameRendered = {
  frame: Frame;
  computed: ComputedDisplayInfo;
} & Action;

export type PCDependencyGraphLoaded = {
  graph: DependencyGraph;
} & Action;

export type PCRuntimeEvaluated = {
  newDocuments: KeyValue<SyntheticDocument>;
  diffs: KeyValue<TreeNodeOperationalTransform[]>;
  allDocuments: SyntheticDocument[];
  catchingUp: boolean;
} & Action;

export const pcFrameRendered = (
  frame: Frame,
  computed: ComputedDisplayInfo
): PCFrameRendered => ({
  type: PC_SYNTHETIC_FRAME_RENDERED,
  frame,
  computed
});

export const pcDependencyGraphLoaded = (
  graph: DependencyGraph
): PCDependencyGraphLoaded => ({
  graph,
  type: PC_DEPENDENCY_GRAPH_LOADED
});

export const pcSourceFileUrisReceived = (
  uris: string[]
): PCSourceFileUrisReceived => ({
  uris,
  type: PC_SOURCE_FILE_URIS_RECEIVED
});

export const pcFrameContainerCreated = (
  frame: Frame,
  $container: HTMLElement
): PCFrameContainerCreated => ({
  frame,
  $container,
  type: PC_SYNTHETIC_FRAME_CONTAINER_CREATED
});

export const pcRuntimeEvaluated = (
  newDocuments: KeyValue<SyntheticDocument>,
  diffs: KeyValue<TreeNodeOperationalTransform[]>,
  allDocuments: SyntheticDocument[],
  catchingUp: boolean
): PCRuntimeEvaluated => ({
  newDocuments,
  diffs,
  catchingUp,
  allDocuments,
  type: PC_RUNTIME_EVALUATED
});
