const { resolve } = require("path");
const { merge } = require("lodash");
const webpack = require("webpack");
const base = require("./webpack-base.config.js");
const WrapperPlugin = require("wrapper-webpack-plugin");

module.exports = merge({}, base, {
  devtool: "eval",
  target: "web",
  mode: "development",
  entry: () => ({}),
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
  output: {
    library: "entry",
    libraryTarget: "umd",
    filename: "[name].js",
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new WrapperPlugin({
      footer: `
        var Component = entry["_"+_ENTRY_COMPONENT_ID]({});
        if (document.querySelector("div")) {
          location.reload();
        }
        var mount = document.createElement("div");
        document.body.appendChild(mount);
        ReactDOM.render(React.createElement(Component), mount);
      `,
    }),
  ],
});
