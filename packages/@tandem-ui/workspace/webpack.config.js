const { resolve } = require("path");
const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const createConfig = require("@tandem-ui/designer/webpack/base.config");

module.exports = createConfig((config) => {
  config.entry = {
    index: path.join(__dirname, "src", "front-end", "designer", "entry.ts"),
  };

  config.output = {
    path: resolve(__dirname, "lib", "front-end"),
    // libraryTarget: "umd",
    filename: "[name].bundle.js",
  };

  return config;
});

// module.exports = {
//     devtool: false,
//     mode: "development",
//     entry: {
//       index: path.join(__dirname, "src", "front-end", "designer", "entry.ts"),
//     },
//     output: {
//       path: resolve(__dirname, "lib", "front-end"),
//       libraryTarget: "umd",
//       filename: "[name].bundle.js",
//     },
//     resolve: {
//       extensions: [".js", ".ts", ".tsx", ".json"],
//       modules: [
//         resolve(__dirname, "..", "src"),
//         resolve(__dirname, "..", "node_modules"),
//         "node_modules",
//       ],
//     },
//     module: {
//       rules: [
//         {
//           test: /\.tsx?$/,
//           loader: "ts-loader",

//           // performance
//           options: { transpileOnly: true },
//         },
//       ],
//     },
//     plugins: [
//       // new CopyPlugin({
//       //   patterns: [
//       //     // { from: path.join(path.dirname(require.resolve("@tandem-ui/designer")), "lib"), to: path.join(__dirname, "lib", "front-end") }
//       //   ]
//       // }),
//       new webpack.ProvidePlugin({
//         process: "process/browser",
//         Buffer: ["buffer", "Buffer"],
//       }),
//     ],
//   };
