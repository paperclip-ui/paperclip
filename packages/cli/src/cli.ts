const { Command } = require("commander");
import { start as install } from "./install";
import { start as init } from "./init";
import { start as open } from "./open";

exports.start = cwd => argv => {
  const program = new Command();

  // program._name = "tandem";

  program
    .command("help")
    .description("Shows CLI help and exits")
    .action(() => {
      program.help();
    });

  program
    .command("install")
    .option("-f, --force")
    .description("install the latest version of Tandem")
    .action(install(cwd));

  program
    .command("init")
    .description("Create a new project")
    .action(init(cwd));

  program
    .command("open")
    .description("Open a Tandem project")
    .action(open(cwd));

  program.parse(argv);
};
