const {resolve} = require('path');
const webpack   = require('webpack');
const fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  devtool: 'none',
  mode: 'development',
  entry: {
    index: [__dirname + '/src/entry.ts']
  },
  output: {
    path: resolve(__dirname, 'build'),
    libraryTarget: "umd",
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    alias: {
      cluster: 'null-loader?cluster',
      net: 'null-loader?net',
      tls: 'null-loader?tls',
      fs: 'null-loader?fs'
    },
    modules: [
      resolve(__dirname, 'src'),
      resolve(__dirname, 'node_modules'),
      'node_modules'

      // fixes bug for resolving mime-db
      // resolve(__dirname, 'node_modules', 'mime-types', 'node_modules')
    ]
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
  module: {
    rules: [
      { test: /\.pc$/, use: [{
          loader: 'paperclip-react-loader',
          options: {
            config: JSON.parse(fs.readFileSync("./app.tdproject", "utf8"))
          }
        }]
      },
      { test: /\.tsx?$/, use: ['ts-loader'] }
    ]
  }
};