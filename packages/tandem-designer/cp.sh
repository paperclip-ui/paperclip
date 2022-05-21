#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const walkFiles = (cwd, each) => {
  for (const fileName of fs.readdirSync(cwd)) {
    const fullPath = path.join(cwd, fileName);
    if (fileName === "node_modules") {
      continue;
    }
    if (fs.lstatSync(fullPath).isDirectory()) {
      walkFiles(fullPath, each);
    } else {
      each(fullPath);
    }
  }
};


walkFiles(process.cwd(), (filePath) => {
  if (path.extname(filePath) !== ".pc") {
    return;
  }

  const dest = filePath.replace(process.cwd(), path.join(process.cwd(), "..", "@tandem-ui", "designer"))
  fs.copyFileSync(filePath, dest);
});