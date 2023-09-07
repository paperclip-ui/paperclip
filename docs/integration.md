To install Paperclip, run:

```
yarn add @paperclip-ui/cli && yarn paperclip init
```

This will install and generate a new Paperclip config file that looks something like this:

```javascript
{

  // Directory where your source code is
  "srcDir": "src",


  // Directory where *.pc files live (optional)
  "designsDir": "src/designs",

  // Options on how to emit JavaScript files
  "compilerOptions": [
    {
      "emit": [
        "css",
        "react.js:js"
      ],
      "outDir": "lib"
    }
  ]
}
```

Next, go ahead and spin up the designer with `yarn paperclip designer --open`, create a new design anywhere you want, then save it.

Finally, run `yarn paperclip build` to compile your PC file, and then import into your JS app.

### Webpack integration

To set up Paperclip with Webpack, just install `paperclip-loader` and set up your Webpack config to something like this:

```typescript
module.exports = {

    // more config...
    module: {
        rules: [
            // more loaders...
            {
                test: /\.pc$/,
                loader: "paperclip-loader"
                options: {
                    configFile: "paperclip.webpack.config.json",
                },
            }
        ],
    },
}
```

To see a more comprehensive example, you can check out the [designer Webpack source code](https://github.com/paperclip-ui/paperclip/blob/master/libs/designer/webpack.config.js#L73).
