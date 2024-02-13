import { loadCLIBinPath } from "@paperclip-ui/releases";

// Dumb check to see if dep. Want to skip this script if in workspace
if (process.cwd().includes("node_modules")) {
  if (process.env.DEBUG) {
    console.debug(`[DEBUG] download CLI release`);
  }
  loadCLIBinPath(__dirname).then(
    (binPath) => {
      process.exit(0);
    },
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
} else if (process.env.DEBUG) {
  console.debug(`[DEBUG] skipping debug`);
}
