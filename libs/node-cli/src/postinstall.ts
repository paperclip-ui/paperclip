import { loadCLIBinPath } from "@paperclip-ui/releases";

loadCLIBinPath(__dirname).then(
  (binPath) => {
    process.exit(0);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
