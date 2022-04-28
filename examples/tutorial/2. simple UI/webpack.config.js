const { resolve } = require("path");
const webpack = require("webpack");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devtool: "none",
  mode: "development",
  entry: {
    index: [__dirname + "/src/entry.ts"]
  },
  output: {
    path: resolve(__dirname, "lib"),
    filename: "[name].bundle.js"
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: [resolve(__dirname, "node_modules")]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/src/index.html"
    })
  ],
  module: {
    rules: [
      {
        test: /.pc$/,
        use: [
          {
            loader: "paperclip-react-loader",
            options: {
              config: JSON.parse(fs.readFileSync("./app.tdproject", "utf8"))
            }
          }
        ]
      },
      {
        test: /.tsx?$/,
        use: ["ts-loader"]
      }
    ]
  }
};
