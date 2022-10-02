import got from "got";
import fs from "fs";
import fsa from "fs-extra";
import * as os from "node:os";
import tar from "tar";
import stream from "node:stream";
import { promisify } from "node:util";
const pipeline = promisify(stream.pipeline);

const pkg = require("../package.json");
const BIN_NAME = "paperclip_cli";
import path from "path";

const OS_VENDOR = {
  win32: "windows",
  darwin: "apple",
  linux: "linux",
}[os.platform as any];

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
          release.minor == releaseVersion.minor
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

  await pipeline(
    got.stream(asset.browser_download_url),
    tar.x({
      C: versionDir,
    })
  );

  return;
};

export const loadCLIBinPath = async (cwd: string) => {
  return path.resolve(__dirname, "../../../target/debug/paperclip_cli");
  const versionDir = path.join(cwd, pkg.version);
  const binPath = path.join(versionDir, BIN_NAME);
  if (!fs.existsSync(binPath)) {
    await downloadRelease(versionDir);
  }
  return binPath;
};

const extractVersionParts = (version: string) => {
  const [major, minor, patch] = version.split(".");
  return { major, minor, patch };
};
