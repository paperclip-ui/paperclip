"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var desktop_1 = require("./desktop");
var tandem_common_1 = require("tandem-common");
var projectPath = process.argv[2];
var project;
if (projectPath) {
    projectPath =
        projectPath.charAt(0) !== "/"
            ? path.join(process.cwd(), projectPath)
            : projectPath;
    project = JSON.parse(fs.readFileSync(projectPath, "utf8"));
}
desktop_1.init({
    tdProjectPath: projectPath && tandem_common_1.normalizeFilePath(projectPath),
    tdProject: project,
    info: {}
});
//# sourceMappingURL=index.js.map