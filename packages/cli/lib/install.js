"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
var path = require("path");
var fs = require("fs");
var constants_1 = require("./constants");
var platform = process.platform, arch = process.arch;
var request = require("request");
var ProgressBar = require("progress");
var fs_extra_1 = require("fs-extra");
var yauzl = require("yauzl");
var extract = require("extract-zip");
var distVersion = require("../package").distVersion;
var archName = "".concat(platform, "-").concat(arch);
var fileName = "".concat(archName, "-v").concat(distVersion, ".zip");
var url = "https://github.com/tandemcode/tandem/releases/download/v".concat(distVersion, "/").concat(archName, ".zip");
var start = function (cwd) { return function (_a) {
    var force = _a.force;
    return download(url, force, path.join(constants_1.TMP_APP_ROOT_DIR, fileName), constants_1.TMP_APP_DIR);
}; };
exports.start = start;
function download(url, force, filePath, unzipPath) {
    return new Promise(function (resolve, reject) {
        if (fs.existsSync(filePath)) {
            if (force) {
                fs.unlinkSync(filePath);
            }
            else {
                return resolve(null);
            }
        }
        try {
            (0, fs_extra_1.mkdirpSync)(path.dirname(filePath));
        }
        catch (e) { }
        try {
            (0, fs_extra_1.mkdirpSync)(path.dirname(unzipPath));
        }
        catch (e) { }
        request
            .get(url)
            .on("response", function (response) {
            var contentLength = parseInt(response.headers["content-length"], 10);
            var bar = new ProgressBar("Downloading Tandem ".concat(distVersion, " [:bar]"), { width: 40, total: contentLength });
            response.on("data", function (chunk) {
                bar.tick(chunk.length);
            });
            response.on("end", function () {
                console.log("\n");
                install(filePath, unzipPath).then(resolve, reject);
            });
        })
            .pipe(fs.createWriteStream(filePath))
            .on("end", resolve);
    }).then(function () {
        return install(filePath, unzipPath);
    });
}
function install(filePath, unzipPath) {
    return new Promise(function (resolve, reject) {
        if (fs.existsSync(unzipPath)) {
            return resolve(null);
        }
        yauzl.open(filePath, function (err, zipFile) {
            var bar = new ProgressBar("Unzipping Tandem ".concat(distVersion, " [:bar]"), {
                width: 40,
                total: zipFile.entryCount
            });
            extract(filePath, { dir: unzipPath, onEntry: function () { return bar.tick(); } }, function (err) {
                if (err) {
                    return console.error(err);
                }
                resolve(null);
            });
        });
    });
}
// function link(unzipPath) {
//   const symlinkPath =  path.join(__dirname, "app", "tandem");
//   const [appFilePath] = glob.sync(path.join(unzipPath, "*/Tandem.app"));
//   const binPath = path.join(appFilePath, "Contents", "Resources", "app", "bin", "tandem");
//   try {
//     fs.unlinkSync(symlinkPath);
//   } catch(e) {
//   }
//   fs.symlinkSync(binPath, symlinkPath);
//   return Promise.resolve();
// }
//# sourceMappingURL=install.js.map