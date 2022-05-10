import * as path from "path";
import * as fs from "fs";
import { TMP_APP_DIR, TMP_APP_ROOT_DIR } from "./constants";
const { platform, arch } = process;
import * as request from "request";
import * as ProgressBar from "progress";
import { mkdirpSync } from "fs-extra";
import * as yauzl from "yauzl";
import * as extract from "extract-zip";
const { distVersion } = require("../package");
const archName = `${platform}-${arch}`;
const fileName = `${archName}-v${distVersion}.zip`;
const url = `https://github.com/tandemcode/tandem/releases/download/v${distVersion}/${archName}.zip`;

type StartOptions = {
  force: boolean;
};

export const start =
  (cwd) =>
  ({ force }: StartOptions) => {
    return download(
      url,
      force,
      path.join(TMP_APP_ROOT_DIR, fileName),
      TMP_APP_DIR
    );
  };

function download(
  url: string,
  force: boolean,
  filePath: string,
  unzipPath: string
) {
  return new Promise<any>((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      if (force) {
        fs.unlinkSync(filePath);
      } else {
        return resolve(null);
      }
    }

    try {
      mkdirpSync(path.dirname(filePath));
    } catch (e) {}

    try {
      mkdirpSync(path.dirname(unzipPath));
    } catch (e) {}

    request
      .get(url)
      .on("response", (response) => {
        const contentLength = parseInt(response.headers["content-length"], 10);
        const bar = new ProgressBar(
          `Downloading Tandem ${distVersion} [:bar]`,
          { width: 40, total: contentLength }
        );

        response.on("data", (chunk) => {
          bar.tick(chunk.length);
        });

        response.on("end", function () {
          console.log("\n");
          install(filePath, unzipPath).then(resolve, reject);
        });
      })
      .pipe(fs.createWriteStream(filePath))
      .on("end", resolve);
  }).then(() => {
    return install(filePath, unzipPath);
  });
}

function install(filePath, unzipPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(unzipPath)) {
      return resolve(null);
    }
    yauzl.open(filePath, (err, zipFile) => {
      const bar = new ProgressBar(`Unzipping Tandem ${distVersion} [:bar]`, {
        width: 40,
        total: zipFile.entryCount,
      });

      extract(
        filePath,
        { dir: unzipPath, onEntry: () => bar.tick() },
        (err) => {
          if (err) {
            return console.error(err);
          }
          resolve(null);
        }
      );
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
