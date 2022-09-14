const { resolve } = require("path");
const webpack = require("webpack");
const fs = require("fs");

module.exports = {
  devtool: "none",
  mode: "production",
  entry: {
    index: [__dirname + "/src/entry.ts"],
  },
  output: {
    path: resolve(__dirname, "dist"),
    libraryTarget: "umd",
    filename: "paperclip-dom-recorder.js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"],
    alias: {
      cluster: "null-loader?cluster",
      net: "null-loader?net",
      tls: "null-loader?tls",
      fs: "null-loader?fs",
    },
    modules: [
      resolve(__dirname, "src"),
      resolve(__dirname, "node_modules"),
      "node_modules",

      // fixes bug for resolving mime-db
      // resolve(__dirname, 'node_modules', 'mime-types', 'node_modules')
    ],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: ["ts-loader"] },
      {
        test: /\.worker.js?$/,
        use: [
          {
            loader: "worker-loader",
            options: {
              inline: true,
            },
          },
        ],
      },
    ],
  },
};
