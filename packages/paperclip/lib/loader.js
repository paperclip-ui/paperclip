"use strict";
/**
TODOS:

- better error messaging for files that are not found
*/
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
exports.loadEntry = void 0;
var tandem_common_1 = require("tandem-common");
var migratePCModule = require("paperclip-migrator");
var dsl_1 = require("./dsl");
var loadEntry = function (entryFileUri, options) { return __awaiter(void 0, void 0, void 0, function () {
    var graph, queue, currentUri, module_1, dependency;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                graph = __assign({}, (options.graph || tandem_common_1.EMPTY_OBJECT));
                queue = [entryFileUri];
                _a.label = 1;
            case 1:
                if (!queue.length) return [3 /*break*/, 3];
                currentUri = queue.shift();
                if (graph[currentUri]) {
                    return [3 /*break*/, 1];
                }
                return [4 /*yield*/, loadModule(currentUri, options)];
            case 2:
                module_1 = _a.sent();
                dependency = createDependency(currentUri, module_1);
                graph[currentUri] = dependency;
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/, {
                    entry: graph[entryFileUri],
                    graph: graph
                }];
        }
    });
}); };
exports.loadEntry = loadEntry;
var createDependency = function (uri, content) { return ({
    uri: uri,
    content: content
}); };
var parseNodeSource = function (source) {
    return JSON.parse(source);
};
var loadModule = function (uri, options) { return __awaiter(void 0, void 0, void 0, function () {
    var content, source;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, options.openFile(uri)];
            case 1:
                content = _a.sent();
                if (!content) {
                    return [2 /*return*/, (0, dsl_1.createPCModule)()];
                }
                // TODO - support other extensions in the future like images
                if (/xml$/.test(uri)) {
                    // TODO - transform XML to JSON
                    throw new Error("XML is not supported yet");
                }
                else if (/pc$/.test(uri)) {
                    try {
                        source = parseNodeSource(content);
                        return [2 /*return*/, migratePCModule(source)];
                    }
                    catch (e) {
                        console.warn(e);
                        return [2 /*return*/, (0, dsl_1.createPCModule)()];
                    }
                }
                else if (!/json$/.test(uri)) {
                    throw new Error("Unsupported import ".concat(uri, "."));
                }
                else {
                    return [2 /*return*/, JSON.parse(content)];
                }
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=loader.js.map