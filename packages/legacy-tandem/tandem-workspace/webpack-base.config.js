const { resolve } = require("path");
const webpack = require("webpack");
const fs = require("fs");

module.exports = {
  devtool: false,
  entry: {
    index: [__dirname + "/src/front-end/index.ts"],
  },
  output: {
    path: resolve(__dirname, "lib", "front-end"),
    libraryTarget: "umd",
    filename: "[name].bundle.js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"],
    alias: {
      cluster: false,
      net: false,
      tls: false,
      fs: false,
    },
    fallback: {
      stream: "stream-browserify",
      path: "path-browserify",
      buffer: "buffer",
      util: "util",
      process: "process/browser",
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
      {
        test: /\.(png|jpg|gif|eot|ttf|woff|woff2|svg)$/,
        use: "url-loader?limit=100000",
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            configFile: require.resolve("./tsconfig.webpack.json"),
          },
        },
      },
    ],
  },
};
