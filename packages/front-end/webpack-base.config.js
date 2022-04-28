const {resolve} = require('path');
const webpack   = require('webpack');
const fs = require("fs");

module.exports = {
  devtool: 'none',
  entry: {
    index: [__dirname + '/src/index.ts']
  },
  output: {
    path: resolve(__dirname, 'lib', 'front-end'),
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
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|eot|ttf|woff|woff2|svg)$/,
        use: 'url-loader?limit=100000'
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader'   },
          { loader: 'css-loader'   },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [__dirname + '/src']
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader'   },
          { loader: 'css-loader'   }
        ]
      },
      { test: /\.pc$/, use: [{
          loader: 'paperclip-react-loader',
          options: {
            config: JSON.parse(fs.readFileSync("./app.tdproject", "utf8"))
          }
        }]
      },
      { test: /\.tsx?$/, use: ['ts-loader'] },
      { test: /\.worker.js?$/, use: [{
        loader: 'worker-loader',
        options: {
          inline: true
        }
      }] }
    ]
  }
};