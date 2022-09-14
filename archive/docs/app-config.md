The app config (`*.tdproject`) files contain information about your application. Here's the basic contents of that file:

```javascript
{

  // (optional)
  "scripts": {

    // (Comming Soon) preview server for components
    "previewServer": "./path/to/preview-server/bin"
  },

  // the root directory of your project. Usually where your .tdproject file lives.
  // This is mainly used to scan for *.pc files
  "rootDir": ".",

  // directories to exclude
  "exclude": ["node_modules"],

  // (optional) The path to the main component file. This file is opened when your
  // tandem project is opened
  "mainFilePath": "./src/main.pc"

  // (optional) Directory where global properties are stored such as colors. If this file
  // is omitted, then globals will be stored in mainFilePath if that's present.
  "globalFilePath" : "./src/global.pc",

  "options": {

    // if false, then typography options will appear for text
    "allowCascadeFonts": true // default value
  }
}
```
