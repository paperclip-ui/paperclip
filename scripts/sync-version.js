const fs = require("fs");
const path = require("path");
const DIRNAME = path.join(__dirname, "../libs");
const version = require("../package.json").version;

const libPaths = fs
  .readdirSync(DIRNAME)
  .reduce((paths, name) => {
    const dir = path.join(DIRNAME, name);
    const pkgPath = path.join(dir, "package.json");
    const tomlPath = path.join(dir, "Cargo.toml");
    return [...paths, pkgPath, tomlPath];
  }, [])
  .filter((path) => fs.existsSync(path));

for (const libPath of libPaths) {
  let content = fs.readFileSync(libPath, "utf8");
  const baseName = path.basename(libPath);

  if (baseName === "Cargo.toml") {
    content = content.replace(/version\s*=\s*".*?"/g, `version = "${version}"`);
  } else if (baseName === "package.json") {
    content = content.replace(/"version": ".*?"/g, `"version": "${version}"`);
  }

  console.log(`${libPath} -> ${version}`);

  fs.writeFileSync(libPath, content);
}
