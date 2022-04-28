Files that have the `*.tdproject` extension contain your Tandem project configuration. Here's a basic example:

```javascript
{

  // (required) - root directory of your project
  "rootDir": ".",

  // (optional)
  "scripts": {

    // build script for your project
    "build": "npm install && npm run build:watch",
    "open": "open http://localhost:8080/"
  },

  // (optional) - directories to exclude when scanning for `*.pc` files
  "exclude": [
    "node_modules"
  ],

  // (optional) - File that is opened when the project is loaded. This is also where your global variables are stored.
  "mainFilePath": "./src/components/main/view.pc"
}
```
