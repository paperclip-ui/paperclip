import { loadCLIBinPath } from "@paperclip-ui/releases";

import { execa } from "execa";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

loadCLIBinPath(__dirname)
  .then((binPath) => {
    execa(binPath, process.argv.slice(2), {
      stdio: "inherit",
      env: process.env,
    });
  })
  .catch((e) => {
    console.error(e);
  });
