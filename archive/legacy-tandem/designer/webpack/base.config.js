const { resolve } = require("path");
const webpack = require("webpack");
const fs = require("fs");
const path = require("path");

module.exports = (createConfig) =>
  createConfig({
    devtool: false,
    mode: "development",
    output: {
      path: resolve(__dirname, "..", "lib"),
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
        os: "os-browserify/browser",
        buffer: "buffer",
        util: "util",
        crypto: "crypto-browserify",
      },
      modules: [
        resolve(__dirname, "..", "src"),
        resolve(__dirname, "..", "node_modules"),
        "node_modules",
      ],
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|eot|ttf|woff|woff2|svg)$/,
          use: "url-loader?limit=100000",
        },
        {
          test: /\.scss$/,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" },
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  includePaths: [__dirname + "/src"],
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [{ loader: "style-loader" }, { loader: "css-loader" }],
        },
        {
          test: /\.pc$/,
          use: [
            {
              loader: "paperclip-react-loader",
              options: {
                config: JSON.parse(
                  fs.readFileSync(
                    path.join(__dirname, "..", "./app.tdproject"),
                    "utf8"
                  )
                ),
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          loader: "ts-loader",

          // performance
          options: { transpileOnly: true },
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ],
  });
