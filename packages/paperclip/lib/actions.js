"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pcRuntimeEvaluated = exports.pcFrameContainerCreated = exports.pcSourceFileUrisReceived = exports.pcDependencyGraphLoaded = exports.pcFrameRendered = exports.PC_RUNTIME_EVALUATED = exports.PC_SYNTHETIC_FRAME_CONTAINER_CREATED = exports.PC_SOURCE_FILE_URIS_RECEIVED = exports.PC_DEPENDENCY_GRAPH_LOADED = exports.PC_SYNTHETIC_FRAME_RENDERED = void 0;
exports.PC_SYNTHETIC_FRAME_RENDERED = "PC_SYNTHETIC_FRAME_RENDERED";
exports.PC_DEPENDENCY_GRAPH_LOADED = "PC_DEPENDENCY_GRAPH_LOADED";
exports.PC_SOURCE_FILE_URIS_RECEIVED = "PC_SOURCE_FILE_URIS_RECEIVED";
exports.PC_SYNTHETIC_FRAME_CONTAINER_CREATED = "PC_SYNTHETIC_FRAME_CONTAINER_CREATED";
exports.PC_RUNTIME_EVALUATED = "PC_RUNTIME_EVALUATED";
var pcFrameRendered = function (frame, computed) { return ({
    type: exports.PC_SYNTHETIC_FRAME_RENDERED,
    frame: frame,
    computed: computed
}); };
exports.pcFrameRendered = pcFrameRendered;
var pcDependencyGraphLoaded = function (graph) { return ({
    graph: graph,
    type: exports.PC_DEPENDENCY_GRAPH_LOADED
}); };
exports.pcDependencyGraphLoaded = pcDependencyGraphLoaded;
var pcSourceFileUrisReceived = function (uris) { return ({
    uris: uris,
    type: exports.PC_SOURCE_FILE_URIS_RECEIVED
}); };
exports.pcSourceFileUrisReceived = pcSourceFileUrisReceived;
var pcFrameContainerCreated = function (frame, $container) { return ({
    frame: frame,
    $container: $container,
    type: exports.PC_SYNTHETIC_FRAME_CONTAINER_CREATED
}); };
exports.pcFrameContainerCreated = pcFrameContainerCreated;
var pcRuntimeEvaluated = function (newDocuments, diffs, allDocuments, catchingUp) { return ({
    newDocuments: newDocuments,
    diffs: diffs,
    catchingUp: catchingUp,
    allDocuments: allDocuments,
    type: exports.PC_RUNTIME_EVALUATED
}); };
exports.pcRuntimeEvaluated = pcRuntimeEvaluated;
//# sourceMappingURL=actions.js.map