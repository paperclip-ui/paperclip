// Dumb check to see if dep. Want to skip this script if in workspace
if (!process.cwd().includes("node_modules")) {
  return;
}

require("@paperclip-ui/releases")
  .loadCLIBinPath(__dirname)
  .then(
    (binPath) => {
      process.exit(0);
    },
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
