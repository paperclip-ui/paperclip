const { merge } = require("lodash");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const { resolve, dirname, join } = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");

const base = require("./webpack-base.config.js");

module.exports = merge({}, base, {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: join(dirname(require.resolve("tandem-designer")), "lib"),
          to: join(__dirname, "lib"),
          filter(filePath) {
            return !["index.html", "index.js"].some((pt) =>
              filePath.includes(pt)
            );
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      title: "Tandem Desktop",
      template: __dirname + "/src/front-end/index.html",
    }),
    new ScriptExtHtmlWebpackPlugin({}),
  ],
  module: {
    rules: [
      ...base.module.rules,
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.webpack.json",
            },
          },
        ],
      },
    ],
  },
});
