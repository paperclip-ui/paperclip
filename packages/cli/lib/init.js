"use strict";
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
exports.start = void 0;
var chalk_1 = require("chalk");
var path = require("path");
var fs = require("fs");
var constants_1 = require("./constants");
/*

- Where would you like UI files to be stored? src
- Where's your modules directory? node_modules
- Create *.tdproject
- stdout:
  - You can now open tandem by running `tandem open`
  - Link docs for configuring build

*/
var start = function (cwd) { return function (argv) { return __awaiter(void 0, void 0, void 0, function () {
    var defaultFilePath, config;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                defaultFilePath = path.join(cwd, constants_1.DEFAULT_PROJECT_FILE_NAME);
                if (fs.existsSync(defaultFilePath)) {
                    console.warn(chalk_1.default.yellow("A Tandem project already exists in this directory."));
                    return [2 /*return*/];
                }
                return [4 /*yield*/, setupConfig()];
            case 1:
                config = _a.sent();
                fs.writeFileSync(defaultFilePath, JSON.stringify(config, null, 2));
                console.log("Created ".concat(defaultFilePath));
                console.log("");
                console.log("Config docs for ".concat(path.basename(defaultFilePath), " can be found at ").concat(chalk_1.default.underline("https://github.com/tandemcode/tandem/blob/master/docs/app-config.md")));
                console.log("");
                console.log(chalk_1.default.white.bold("You can now run"), chalk_1.default.bold.blue("tandem open"));
                console.log("");
                return [2 /*return*/];
        }
    });
}); }; };
exports.start = start;
var setupConfig = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // const {rootDir} = await inquirer.prompt<any>([
        //   {
        //     type: "input",
        //     name: "rootDir",
        //     message: "What's the root directory of your project?",
        //     default: "."
        //   }
        // ]);
        return [2 /*return*/, {
                rootDir: ".",
                exclude: ["node_modules"]
            }];
    });
}); };
var pickProjectFilePath = function (cwd) { return __awaiter(void 0, void 0, void 0, function () {
    var defaultFilePath;
    return __generator(this, function (_a) {
        defaultFilePath = path.join(cwd, constants_1.DEFAULT_PROJECT_FILE_NAME);
        if (!fs.existsSync(defaultFilePath)) {
            return [2 /*return*/, defaultFilePath];
        }
        return [2 /*return*/, null];
    });
}); };
//# sourceMappingURL=init.js.map