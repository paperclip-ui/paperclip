import got from "got";
import fs from "fs";
import fsa from "fs-extra";
import * as os from "node:os";
const pkg = require("../package.json");
import path from "path";

// paperclip_test2_x86_64-pc-windows-gnu.zip

const OS_VENDOR = {
  win32: "windows",
  darwin: "apple",
  linux: "linux",
}[os.platform as any];

export const downloadRelease = async (releaseDir: string) => {
  const currentVersion = extractVersionParts(pkg.version);
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
    fsa.mkdirSync(releaseDir);
  } catch (e) {}
  const zipPath = path.join(
    releaseDir,
    path.basename(asset.browser_download_url)
  );

  (await got.get(asset.browser_download_url)).pipe(
    fs.createWriteStream(zipPath)
  );

  console.log(zipPath);
};

const extractVersionParts = (version: string) => {
  const [major, minor, patch] = version.split(".");
  return { major, minor, patch };
};

downloadRelease("/tmp/releases");
