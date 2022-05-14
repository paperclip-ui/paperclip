const { resolve } = require("path");
const { merge } = require("lodash");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const base = require("./webpack-base.config.js");

module.exports = [
  // ESM
  merge({}, base, {
    entry: {
      index: [__dirname + "/src/index.tsx"],
    },
    mode: "development",
    plugins: [],
  }),

  // standalone
  merge({}, base, {
    mode: "development",
    entry: {
      index: [__dirname + "/src/entry.ts"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "Tandem Playground",
        template: __dirname + "/src/index.html",
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
    ],
  }),
];
