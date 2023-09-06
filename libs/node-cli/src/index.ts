import { loadCLIBinPath } from "@paperclip-ui/releases";

import execa from "execa";

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
