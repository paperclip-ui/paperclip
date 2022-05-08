const {resolve, dirname, join} = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

console.log(join(dirname(require.resolve("tandem-front-end")), "lib"));

module.exports = {
  plugins: [new CopyPlugin({
    patterns: [
      { from: join(dirname(require.resolve("tandem-front-end")), "lib"), to: join(__dirname, "lib")}
    ]
  })],
  externals: [nodeExternals()],
  entry: {
    entry: [__dirname + '/src/front-end/entry.ts']
  },
  output: {
    path: resolve(__dirname, 'lib', 'front-end'),
    filename: 'entry.bundle.js'
  },
  devtool: false,
  mode: "development",
  target: "electron-renderer",
  devServer: {
    hot: true,
    inline: true
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    alias: {
      cluster: false,
      net: false,
      tls: false,
      fs: false,
      fsevents: false
    },
    fallback: {
      process: "process/browser"
    },  
    modules: [
      resolve(__dirname, 'src'),
      resolve(__dirname, 'node_modules'),
      resolve(__dirname, '..', '..', 'node_modules')
    ]
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|eot|ttf|woff|woff2|svg)$/,
        use: 'url-loader?limit=1000'
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
    ]
  }
};