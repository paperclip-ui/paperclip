"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Command = require("commander").Command;
var install_1 = require("./install");
var init_1 = require("./init");
var open_1 = require("./open");
exports.start = function (cwd) {
  return function (argv) {
    var program = new Command();
    // program._name = "tandem";
    program
      .command("help")
      .description("Shows CLI help and exits")
      .action(function () {
        program.help();
      });
    program
      .command("install")
      .option("-f, --force")
      .description("install the latest version of Tandem")
      .action((0, install_1.start)(cwd));
    program
      .command("init")
      .description("Create a new project")
      .action((0, init_1.start)(cwd));
    program
      .command("open")
      .description("Open a Tandem project")
      .action((0, open_1.start)(cwd));
    program.parse(argv);
  };
};
//# sourceMappingURL=cli.js.map
