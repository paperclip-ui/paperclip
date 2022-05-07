"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookRemotePCRuntime = exports.createRemotePCRuntime = exports.createLocalPCRuntime = exports.RemotePCRuntime = void 0;
var events_1 = require("events");
var evaluate_1 = require("./evaluate");
var tandem_common_1 = require("tandem-common");
var lodash_1 = require("lodash");
var ot_1 = require("./ot");
var dsl_1 = require("./dsl");
var LocalPCRuntime = /** @class */ (function (_super) {
    __extends(LocalPCRuntime, _super);
    function LocalPCRuntime(info) {
        var _this = _super.call(this) || this;
        _this._syntheticDocuments = {};
        if (info) {
            _this.setInfo(info);
        }
        return _this;
    }
    Object.defineProperty(LocalPCRuntime.prototype, "lastUpdatedAt", {
        get: function () {
            return this._lastUpdatedAt;
        },
        enumerable: false,
        configurable: true
    });
    LocalPCRuntime.prototype.setInfo = function (value, timestamp) {
        if (timestamp === void 0) { timestamp = Date.now(); }
        if (this._info === value) {
            return;
        }
        this._lastUpdatedAt = timestamp;
        this._info = value;
        this._evaluate();
    };
    LocalPCRuntime.prototype.getInfo = function () {
        return this._info;
    };
    LocalPCRuntime.prototype._evaluate = function () {
        var _this = this;
        if (this._evaluating) {
            return;
        }
        this._evaluating = true;
        // This is primarily here to prevent synchronous access
        // synthetic objects after dependency graph patching
        setTimeout(function () {
            _this._evaluating = false;
            _this._evaluateNow();
        });
    };
    Object.defineProperty(LocalPCRuntime.prototype, "syntheticDocuments", {
        get: function () {
            return Object.values(this._syntheticDocuments);
        },
        enumerable: false,
        configurable: true
    });
    LocalPCRuntime.prototype._evaluateNow = function () {
        var marker = (0, tandem_common_1.pmark)("LocalPCRuntime._evaluateNow()");
        var diffs = {};
        var newDocumentMap = {};
        var documentMap = {};
        var deletedDocumentIds = [];
        var newSyntheticDocuments = (0, evaluate_1.evaluateDependencyGraph)(this._info.graph, this._info.rootDirectory, this._info.variants, this._info.priorityUris);
        for (var uri in newSyntheticDocuments) {
            var newSyntheticDocument = newSyntheticDocuments[uri];
            var prevSyntheticDocument = this._syntheticDocuments[uri];
            if (prevSyntheticDocument) {
                var ots = (0, ot_1.diffTreeNode)(prevSyntheticDocument, newSyntheticDocument);
                if (ots.length) {
                    prevSyntheticDocument = documentMap[uri] = (0, ot_1.patchTreeNode)(ots, prevSyntheticDocument);
                    diffs[uri] = ots;
                }
                else {
                    documentMap[uri] = prevSyntheticDocument;
                }
            }
            else {
                newDocumentMap[uri] = documentMap[uri] = newSyntheticDocument;
            }
        }
        for (var uri in this._syntheticDocuments) {
            if (!this._info.graph[uri]) {
                deletedDocumentIds.push(uri);
                delete this._syntheticDocuments[uri];
            }
        }
        Object.assign(this._syntheticDocuments, documentMap);
        marker.end();
        this.emit("evaluate", newDocumentMap, diffs, deletedDocumentIds, this._lastUpdatedAt);
    };
    return LocalPCRuntime;
}(events_1.EventEmitter));
var RemotePCRuntime = /** @class */ (function (_super) {
    __extends(RemotePCRuntime, _super);
    function RemotePCRuntime(_remote, info) {
        var _this = _super.call(this) || this;
        _this._remote = _remote;
        _this._onRemoteMessage = function (event) {
            var _a = event.data, type = _a.type, payload = _a.payload;
            var marker = (0, tandem_common_1.pmark)("Runtime._onRemoteMessage()");
            if (type === "fetchInfo") {
                _this._remote.postMessage({
                    type: "info",
                    payload: _this._info
                });
            }
            else if (type === "evaluate") {
                var newDocuments = payload[0], diffs = payload[1], deletedDocumentUris = payload[2], timestamp = payload[3];
                _this._syntheticDocuments = __assign(__assign({}, _this._syntheticDocuments), newDocuments);
                for (var uri in diffs) {
                    _this._syntheticDocuments[uri] = (0, ot_1.patchTreeNode)(diffs[uri], _this._syntheticDocuments[uri]);
                }
                for (var _i = 0, deletedDocumentUris_1 = deletedDocumentUris; _i < deletedDocumentUris_1.length; _i++) {
                    var uri = deletedDocumentUris_1[_i];
                    delete _this._syntheticDocuments[uri];
                }
                _this.emit("evaluate", newDocuments, diffs, deletedDocumentUris, timestamp);
            }
            else if (type === "allSyntheticDocuments") {
                _this._syntheticDocuments = payload;
                _this.emit("evaluate", payload, {}, [], Date.now());
            }
            marker.end();
        };
        if (info) {
            _this.setInfo(info);
        }
        _this._remote.addEventListener("message", _this._onRemoteMessage);
        _this._remote.postMessage({ type: "fetchAllSyntheticDocuments" });
        return _this;
    }
    Object.defineProperty(RemotePCRuntime.prototype, "lastUpdatedAt", {
        get: function () {
            return this._lastUpdatedAt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RemotePCRuntime.prototype, "syntheticDocuments", {
        get: function () {
            return Object.values(this._syntheticDocuments);
        },
        enumerable: false,
        configurable: true
    });
    RemotePCRuntime.prototype.getInfo = function () {
        return this._info;
    };
    RemotePCRuntime.prototype.setInfo = function (value, timestamp) {
        if (timestamp === void 0) { timestamp = Date.now(); }
        if (this._info === value) {
            return;
        }
        var oldInfo = this._info;
        this._info = value;
        var changes = {};
        for (var uri in value.graph) {
            var oldDep = oldInfo && oldInfo.graph[uri];
            if (oldDep) {
                var ots = (0, ot_1.diffTreeNode)(oldDep.content, value.graph[uri].content);
                changes[uri] = ots;
            }
            else {
                changes[uri] = value.graph[uri].content;
            }
        }
        if (Object.keys(changes).length ||
            !(0, lodash_1.isEqual)(value.variants, (oldInfo || tandem_common_1.EMPTY_OBJECT).variants)) {
            this._remote.postMessage({
                type: "infoChanges",
                payload: {
                    changes: changes,
                    variants: value.variants,
                    priorityUris: value.priorityUris,
                    lastUpdatedAt: (this._lastUpdatedAt = timestamp)
                }
            });
        }
    };
    return RemotePCRuntime;
}(events_1.EventEmitter));
exports.RemotePCRuntime = RemotePCRuntime;
var createLocalPCRuntime = function (info) {
    return new LocalPCRuntime(info);
};
exports.createLocalPCRuntime = createLocalPCRuntime;
var createRemotePCRuntime = function (remote, info) { return new RemotePCRuntime(remote, info); };
exports.createRemotePCRuntime = createRemotePCRuntime;
var patchDependencyGraph = function (changes, oldGraph) {
    var newGraph = {};
    for (var uri in changes) {
        var change = changes[uri];
        if (Array.isArray(change)) {
            newGraph[uri] = change.length
                ? (0, dsl_1.createPCDependency)(uri, (0, ot_1.patchTreeNode)(change, oldGraph[uri].content))
                : oldGraph[uri];
        }
        else {
            newGraph[uri] = (0, dsl_1.createPCDependency)(uri, change);
        }
    }
    return newGraph;
};
var hookRemotePCRuntime = function (localRuntime, remote) { return __awaiter(void 0, void 0, void 0, function () {
    var _sentDocuments, sendDocuments;
    return __generator(this, function (_a) {
        _sentDocuments = false;
        sendDocuments = function () {
            _sentDocuments = true;
            remote.postMessage({
                type: "allSyntheticDocuments",
                payload: localRuntime.syntheticDocuments
            });
        };
        remote.addEventListener("message", function (event) {
            var _a = event.data, type = _a.type, payload = _a.payload;
            if (type === "fetchAllSyntheticDocuments") {
                sendDocuments();
            }
            else if (type === "info") {
                localRuntime.setInfo(payload);
            }
            else if (type === "infoChanges") {
                var localInfo = localRuntime.getInfo() || tandem_common_1.EMPTY_OBJECT;
                localRuntime.setInfo(__assign(__assign({}, localInfo), { variants: payload.variants, graph: patchDependencyGraph(payload.changes, localInfo.graph), priorityUris: payload.priorityUris }), payload.lastUpdatedAt);
            }
        });
        remote.postMessage({ type: "fetchInfo" });
        localRuntime.on("evaluate", function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (_sentDocuments) {
                remote.postMessage({ type: "evaluate", payload: args });
            }
            else {
                sendDocuments();
            }
        });
        return [2 /*return*/];
    });
}); };
exports.hookRemotePCRuntime = hookRemotePCRuntime;
//# sourceMappingURL=runtime.js.map