import got from "got";
import fs from "fs";
import fsa from "fs-extra";
import * as os from "node:os";
import tar from "tar";
import stream from "node:stream";
import { promisify } from "node:util";
import execa from "execa";

const pipeline = promisify(stream.pipeline);

const pkg = require("../package.json");
const BIN_NAME = "paperclip_cli";
import path from "path";

const OS_VENDOR = {
  win32: "x86_64-pc-windows-gnu",
  darwin: "x86_64-apple-darwin",
  linux: "x86_64-unknown-linux-musl",
}[os.platform()];

const downloadRelease = async (versionDir: string) => {
  const version = path.basename(versionDir);
  const currentVersion = extractVersionParts(version);

  const releases = (await got
    .get(`https://api.github.com/repos/paperclip-ui/paperclip/releases`)
    .json()) as any[];

  const matchingRelease =
    releases
      .filter((release) => {
        const releaseVersion = extractVersionParts(release.tag_name);
        return (
          releaseVersion.major === currentVersion.major &&
          releaseVersion.minor === currentVersion.minor &&
          releaseVersion.patch === currentVersion.patch
        );
      })
      .sort((a, b) => {
        return Number(extractVersionParts(a.tag_name).patch) >
          Number(extractVersionParts(b.tag_name).patch)
          ? -1
          : 1;
      })[0] || releases[0];

  if (!matchingRelease) {
    throw new Error(
      `No matching release for ${currentVersion.major}.${currentVersion.major}`
    );
  }

  const asset = matchingRelease.assets.find((asset) => {
    return asset.name.includes(OS_VENDOR);
  });

  if (!asset) {
    throw new Error(`${os.platform} is not currently supported`);
  }

  try {
    fsa.mkdirpSync(versionDir);
  } catch (e) {}

  const filePath = path.join(
    versionDir,
    path.basename(asset.browser_download_url)
  );

  await pipeline(
    got.stream(asset.browser_download_url),
    fs.createWriteStream(filePath)
  );

  await decompress(filePath);
};

const decompress = async (filePath: string) => {
  if (/\.dmg$/.test(filePath)) {
    const { stdout, stderr } = await execa(`hdiutil`, ["attach", filePath]);

    if (stderr) {
      throw new Error(stderr.toString());
    }

    const volumeDir = stdout.match(/\/Volumes\/[^\n]+/)[0];

    for (const basename of await fsa.readdir(volumeDir)) {
      await fsa.copyFile(
        path.join(volumeDir, basename),
        path.join(path.dirname(filePath), basename)
      );
    }

    await execa("hdiutil", ["detach", volumeDir]);
  } else {
    await pipeline(
      fs.createReadStream(filePath),
      tar.x({
        C: path.dirname(filePath),
      })
    );
  }
};

export const loadCLIBinPath = async (cwd: string) => {
  const versionDir = path.join(cwd, pkg.version);
  const binPath = path.join(versionDir, BIN_NAME);
  if (!fs.existsSync(binPath)) {
    await downloadRelease(versionDir);
  }
  return binPath;
};

const extractVersionParts = (version: string) => {
  const [major, minor, patch] = version.replace(/^v/, "").split(".");
  return { major, minor, patch };
};
