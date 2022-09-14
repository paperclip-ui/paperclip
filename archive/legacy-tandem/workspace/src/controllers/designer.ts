import express from "express";
import * as path from "path";
import * as fs from "fs";

const DESIGNER_DIST_PATH = path.join(__dirname, "..", "front-end");

// simple assertion - this must exist
if (fs.lstatSync) {
  fs.lstatSync(path.join(DESIGNER_DIST_PATH, "index.html"));
}

export const addDesignerRoutes = (_express: express.Express) => {
  _express.use(express.static(DESIGNER_DIST_PATH));
};
