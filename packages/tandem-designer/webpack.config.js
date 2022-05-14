const HtmlWebpackPlugin = require("html-webpack-plugin");
const createConfig = require("./webpack/base.config.js");

module.exports = [
  // ESM
  createConfig((config) => {
    config.entry = {
      index: [__dirname + "/src/index.tsx"],
    };
    return config;
  }),

  createConfig((config) => {
    (config.entry = {
      index: [__dirname + "/src/entry.ts"],
    }),
      config.plugins.push(
        new HtmlWebpackPlugin({
          title: "Tandem Playground",
          template: __dirname + "/src/index.html",
        })
      );

    return config;
  }),
];
