const { resolve } = require("path");
const { merge } = require("lodash");
const webpack = require("webpack");
const createWebpackConfig = require("@tandem-ui/designer/webpack/base.config");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const base = require("./webpack-base.config.js");
const path = require("path");

module.exports = merge({}, base, {
  mode: "development",
  plugins: [
    // need to copy designer assets to lib since async resouces
    // are loaded.
    new CopyPlugin({
      patterns: [
        {
          from: path.join(
            path.dirname(require.resolve("@tandem-ui/designer")),
            "lib",
            "front-end"
          ),
          to: path.join(__dirname, "lib", "front-end"),
          filter: (filePath) => {
            return !/(index.bundle.js|index.html)$/.test(filePath);
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      title: "Tandem Playground",
      template: __dirname + "/src/front-end/index.html",
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
});
