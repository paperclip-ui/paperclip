const fs = require('fs');
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')


module.exports = {
  resolve: {    
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
  module: {
    rules: [{
      loader: 'ts-loader',
      test: /\.tsx?$/
    }, {
      loader: 'paperclip-react-loader',
      options: {
        config: JSON.parse(fs.readFileSync(path.resolve(__dirname, 'app.tdproject'), 'utf8'))
      },
      test: /\.pc$/
    }]
  },

  entry: './src/entry.ts',

  plugins: [
    new HtmlWebpackPlugin({
      title: 'App name',
      // Load a custom template (lodash by default see the FAQ for details)
      template: 'src/index.html'
    })
  ],

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  mode: 'development',

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/
        }
      },

      chunks: 'async',
      minChunks: 1,
      minSize: 30000,
      name: true
    }
  }
}