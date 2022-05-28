const { resolve } = require("path");
const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  devtool: false,
  mode: "development",
  entry: {
    index: path.join(__dirname, "src", "front-end", "designer", "entry.ts"),
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json", ".mjs"],
    fullySpecified: false,
    alias: {
      cluster: false,
      net: false,
      tls: false,
      fs: false,
    },
    fallback: {
      stream: "stream-browserify",
      path: "path-browserify",
      os: "os-browserify/browser",
      buffer: "buffer",
      util: "util",
    },
    modules: [
      // resolve(__dirname, "..", "src"),
      // resolve(__dirname, "..", "node_modules"),
      "node_modules",
    ],
  },
  output: {
    path: resolve(__dirname, "lib", "front-end"),
    // libraryTarget: "umd",
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          configFile: require.resolve("./tsconfig.webpack.json"),
        },
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(
            path.dirname(require.resolve("@tandem-ui/designer")),
            "lib"
          ),
          to: path.join(__dirname, "lib", "front-end"),
        },
      ],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
