const { resolve } = require("path");
const { merge } = require("lodash");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const base = require("./webpack-base.config.js");

module.exports = merge({}, base, {
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Aerial Playground",
      template: __dirname + "/src/front-end/index.html",
    }),
    new webpack.DefinePlugin({
      "process.env": "({})",
    }),
  ],
});
