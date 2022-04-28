**Installation**: `npm install paperclip-react-loader`

**Documentation for writing React controllers can be found in the [paperclip-react-compiler](../paperclip-react-compiler) package.**

This is a Webpack loader for converting Tandem UI files ([\*.pc](../../documentation/ui-files.md)) into React components. Here's a basic `webpack.config.js` example:

```javascript
const fs = require("fs");

module.exports = {
  mode: "development",
  entry: "./src/index,js",
  output: {
    path: "./lib",
    filename: "[name].bundle.js"
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  module: {
    rules: [
      {
        test: /.pc$/,
        use: [
          {
            loader: "paperclip-react-loader",
            options: {
              // the config is just the contents of your Tandem project file.
              config: JSON.parse(fs.readFileSync("./app.tdproject", "utf8"))
            }
          }
        ]
      }
    ]
  }
};
```

With the above config, we can load `*.pc` files into our app like normal modules. For example:

```javascript
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Application } from "./app.pc";
ReactDOM.render(<Application />);
```

Documentation for using imported `*.pc` modules can be found in the [paperclip-react-compiler package](../paperclip-react-compiler)
