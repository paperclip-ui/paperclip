const { resolve } = require("path");
const { merge } = require("lodash");
const webpack = require("webpack");
const createWebpackConfig = require("tandem-designer/webpack/base.config");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const base = require("./webpack-base.config.js");

module.exports = merge({}, base, {
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Tandem Playground",
      template: __dirname + "/src/front-end/index.html",
    }),
    new webpack.DefinePlugin({
      "process.env": "({})",
    }),
  ],
});
