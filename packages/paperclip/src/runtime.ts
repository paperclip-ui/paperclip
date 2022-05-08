import { DependencyGraph, Dependency } from "./graph";
import { EventEmitter } from "events";
import { SyntheticDocument } from "./synthetic";
import { evaluateDependencyGraph } from "./evaluate";
import { KeyValue, pmark, EMPTY_OBJECT } from "tandem-common";
import { isEqual, remove } from "lodash";
import {
  patchTreeNode,
  TreeNodeOperationalTransform,
  diffTreeNode
} from "./ot";
import { PCModule, createPCDependency } from "./dsl";

export interface PCRuntime extends EventEmitter {
  getInfo(): LocalRuntimeInfo;
  setInfo(value: LocalRuntimeInfo, timestamp?: number);
  readonly syntheticDocuments: SyntheticDocument[];
  readonly lastUpdatedAt: number;
  on(
    event: "dependencyUpdated",
    listener: (dependency: Dependency<any>, graph: DependencyGraph) => void
  ): this;
  on(
    event: "evaluate",
    listener: (
      newDocuments: KeyValue<SyntheticDocument>,
      diffs: KeyValue<TreeNodeOperationalTransform[]>,
      deletedDocumentIds: string[],
      timestamp: number
    ) => void
  ): this;
}

export type LocalRuntimeInfo = {
  graph: DependencyGraph;
  variants: KeyValue<KeyValue<boolean>>;
  rootDirectory: string;
  priorityUris: string[];
};

class LocalPCRuntime extends EventEmitter implements PCRuntime {
  private _evaluating: boolean;
  private _info: LocalRuntimeInfo;
  private _lastUpdatedAt: number;
  private _syntheticDocuments: KeyValue<SyntheticDocument>;

  constructor(info: LocalRuntimeInfo) {
    super();
    this._syntheticDocuments = {};
    if (info) {
      this.setInfo(info);
    }
  }

  get lastUpdatedAt() {
    return this._lastUpdatedAt;
  }

  setInfo(value: LocalRuntimeInfo, timestamp: number = Date.now()) {
    if (this._info === value) {
      return;
    }
    this._lastUpdatedAt = timestamp;
    this._info = value;
    this._evaluate();
  }

  getInfo() {
    return this._info;
  }

  private _evaluate() {
    if (this._evaluating) {
      return;
    }
    this._evaluating = true;

    // This is primarily here to prevent synchronous access
    // synthetic objects after dependency graph patching
    setTimeout(() => {
      this._evaluating = false;
      this._evaluateNow();
    });
  }

  get syntheticDocuments(): SyntheticDocument[] {
    return Object.values(this._syntheticDocuments);
  }

  private _evaluateNow() {
    const marker = pmark("LocalPCRuntime._evaluateNow()");
    const diffs: KeyValue<TreeNodeOperationalTransform[]> = {};
    const newDocumentMap: KeyValue<SyntheticDocument> = {};
    const documentMap = {};
    const deletedDocumentIds = [];
    const newSyntheticDocuments = evaluateDependencyGraph(
      this._info.graph,
      this._info.rootDirectory,
      this._info.variants,
      this._info.priorityUris
    );

    for (const uri in newSyntheticDocuments) {
      const newSyntheticDocument = newSyntheticDocuments[uri];
      let prevSyntheticDocument = this._syntheticDocuments[uri];
      if (prevSyntheticDocument) {
        const ots = diffTreeNode(prevSyntheticDocument, newSyntheticDocument);
        if (ots.length) {
          prevSyntheticDocument = documentMap[uri] = patchTreeNode(
            ots,
            prevSyntheticDocument
          );
          diffs[uri] = ots;
        } else {
          documentMap[uri] = prevSyntheticDocument;
        }
      } else {
        newDocumentMap[uri] = documentMap[uri] = newSyntheticDocument;
      }
    }

    for (const uri in this._syntheticDocuments) {
      if (!this._info.graph[uri]) {
        deletedDocumentIds.push(uri);
        delete this._syntheticDocuments[uri];
      }
    }

    Object.assign(this._syntheticDocuments, documentMap);
    marker.end();

    this.emit(
      "evaluate",
      newDocumentMap,
      diffs,
      deletedDocumentIds,
      this._lastUpdatedAt
    );
  }
}

export type DependencyGraphChanges = KeyValue<
  PCModule | TreeNodeOperationalTransform[]
>;

export class RemotePCRuntime extends EventEmitter implements PCRuntime {
  private _info: LocalRuntimeInfo;
  private _syntheticDocuments: KeyValue<SyntheticDocument>;
  private _lastUpdatedAt: number;
  constructor(private _remote: Worker, info?: LocalRuntimeInfo) {
    super();

    if (info) {
      this.setInfo(info);
    }

    this._remote.addEventListener("message", this._onRemoteMessage);
    this._remote.postMessage({ type: "fetchAllSyntheticDocuments" });
  }
  get lastUpdatedAt() {
    return this._lastUpdatedAt;
  }

  get syntheticDocuments() {
    return Object.values(this._syntheticDocuments);
  }

  getInfo() {
    return this._info;
  }

  setInfo(value: LocalRuntimeInfo, timestamp: number = Date.now()) {
    if (this._info === value) {
      return;
    }
    const oldInfo = this._info;
    this._info = value;

    const changes = {};

    for (const uri in value.graph) {
      const oldDep = oldInfo && oldInfo.graph[uri];
      if (oldDep) {
        const ots = diffTreeNode(oldDep.content, value.graph[uri].content);
        changes[uri] = ots;
      } else {
        changes[uri] = value.graph[uri].content;
      }
    }

    if (
      Object.keys(changes).length ||
      !isEqual(value.variants, (oldInfo || EMPTY_OBJECT).variants)
    ) {
      this._remote.postMessage({
        type: "infoChanges",
        payload: {
          changes,
          variants: value.variants,
          priorityUris: value.priorityUris,
          lastUpdatedAt: this._lastUpdatedAt = timestamp
        }
      });
    }
  }

  private _onRemoteMessage = event => {
    const { type, payload } = event.data;
    const marker = pmark("Runtime._onRemoteMessage()");
    if (type === "fetchInfo") {
      this._remote.postMessage({
        type: "info",
        payload: this._info
      });
    } else if (type === "evaluate") {
      const [newDocuments, diffs, deletedDocumentUris, timestamp] = payload;
      this._syntheticDocuments = {
        ...this._syntheticDocuments,
        ...newDocuments
      };

      for (const uri in diffs) {
        this._syntheticDocuments[uri] = patchTreeNode(
          diffs[uri],
          this._syntheticDocuments[uri]
        );
      }

      for (const uri of deletedDocumentUris) {
        delete this._syntheticDocuments[uri];
      }

      this.emit(
        "evaluate",
        newDocuments,
        diffs,
        deletedDocumentUris,
        timestamp
      );
    } else if (type === "allSyntheticDocuments") {
      this._syntheticDocuments = payload;
      this.emit("evaluate", payload, {}, [], Date.now());
    }

    marker.end();
  };
}

export const createLocalPCRuntime = (info?: LocalRuntimeInfo) =>
  new LocalPCRuntime(info);
export const createRemotePCRuntime = (
  remote: Worker,
  info?: LocalRuntimeInfo
) => new RemotePCRuntime(remote, info);

const patchDependencyGraph = (
  changes: DependencyGraphChanges,
  oldGraph: DependencyGraph
) => {
  let newGraph = {};
  for (const uri in changes) {
    const change = changes[uri];
    if (Array.isArray(change)) {
      newGraph[uri] = change.length
        ? createPCDependency(uri, patchTreeNode(change, oldGraph[uri].content))
        : oldGraph[uri];
    } else {
      newGraph[uri] = createPCDependency(uri, change);
    }
  }

  return newGraph;
};

console.log("OK");

export const hookRemotePCRuntime = async (
  localRuntime: PCRuntime,
  remote: Worker
) => {
  let _sentDocuments = false;

  const sendDocuments = () => {
    _sentDocuments = true;
    remote.postMessage({
      type: "allSyntheticDocuments",
      payload: localRuntime.syntheticDocuments
    });
  };

  remote.addEventListener("message", event => {
    console.log("FET");
    const { type, payload } = event.data;
    if (type === "fetchAllSyntheticDocuments") {
      sendDocuments();
    } else if (type === "info") {
      localRuntime.setInfo(payload);
    } else if (type === "infoChanges") {
      const localInfo = localRuntime.getInfo() || EMPTY_OBJECT;
      localRuntime.setInfo(
        {
          ...localInfo,
          variants: payload.variants,
          graph: patchDependencyGraph(payload.changes, localInfo.graph),
          priorityUris: payload.priorityUris
        },
        payload.lastUpdatedAt
      );
    }
  });

  remote.postMessage({ type: "fetchInfo" });

  localRuntime.on("evaluate", (...args) => {
    if (_sentDocuments) {
      remote.postMessage({ type: "evaluate", payload: args });
    } else {
      sendDocuments();
    }
  });
};
