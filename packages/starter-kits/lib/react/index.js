"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFiles = exports.template = void 0;
var paperclip_1 = require("paperclip");
var tandem_common_1 = require("tandem-common");
exports.template = {
    id: "react",
    icon: null,
    label: "React",
    description: "TypeScript + React + Webpack starter project."
};
var createFiles = function (_a) {
    var _b;
    var _c = _a.packageName, packageName = _c === void 0 ? "my-app-name" : _c;
    var mainComponent = (0, paperclip_1.createPCComponent)("Application", null, null, null, [(0, paperclip_1.createPCTextNode)("App content")], (_b = {},
        _b[paperclip_1.PCVisibleNodeMetadataKey.BOUNDS] = (0, tandem_common_1.createBounds)(0, 600, 0, 400),
        _b));
    mainComponent = __assign(__assign({}, mainComponent), { controllers: ["./controller.tsx"] });
    return {
        "package.json": JSON.stringify({
            name: packageName,
            version: "1.0.0",
            description: "",
            main: "index.js",
            scripts: {
                test: 'echo "Error: no test specified" && exit 1',
                build: 'paperclip-react-compiler "src/**/*.pc" --definition --write && webpack',
                "build:watch": 'concurrently "paperclip-react-compiler \\"src/**/*.pc\\" --definition --write --watch" "webpack-dev-server --port=8080 --open"'
            },
            repository: {
                type: "git",
                url: "git+https://github.com/tandemcode/tandem-react-starter-kit.git"
            },
            author: "",
            license: "ISC",
            bugs: {
                url: "https://github.com/tandemcode/tandem-react-starter-kit/issues"
            },
            homepage: "https://github.com/tandemcode/tandem-react-starter-kit#readme",
            devDependencies: {
                concurrently: "^4.0.1",
                "html-webpack-plugin": "^3.2.0",
                "paperclip-react-loader": "10.1.x",
                "@types/react": "^16.7.3",
                "@types/react-dom": "^16.0.9",
                "ts-loader": "^4.4.2",
                typescript: "^2.9.2",
                webpack: "^4.15.1",
                "webpack-cli": "^3.0.8",
                "paperclip-react-compiler": "10.1.x",
                "webpack-dev-server": "3.x.x"
            },
            dependencies: {
                react: "^16.4.1",
                "react-dom": "^16.4.1"
            }
        }, null, 2),
        "README.md": "\n\nThis is a basic starter project for React-based applications.\n\n#### Installation\n\nStart by running `npm install` or `yarn install` in terminal, then run `npm run build`. After that, open\nlib/index.html.\n\n#### Directory structure\n\n```\nlib/ # the build directory\nsrc/ # all source files\n  components/ # all component files\n  entry.js # main entry point into application\n```\n\n#### Terminal commands\n\n```\nnpm run build # builds the project\nnpm run build:watch # builds & watches project for any changes\n```\n\n\n",
        "app.tdproject": JSON.stringify({
            scripts: {
                // want to have an install here in case we're starting with a fresh project, OR there's an update.
                // may eventually want to change this to a start.sh script.
                build: "npm install && npm run build:watch",
                open: "open http://localhost:8080/"
            },
            rootDir: ".",
            exclude: ["node_modules"],
            mainFilePath: "./src/components/main/view.pc"
        }, null, 2),
        "tsconfig.json": JSON.stringify({
            compileOnSave: true,
            compilerOptions: {
                target: "es5",
                sourceMap: true,
                lib: ["es2015.promise", "dom", "es5", "esnext"],
                module: "commonjs",
                outDir: "lib",
                jsx: "react",
                baseUrl: "src",
                experimentalDecorators: true
            },
            exclude: ["node_modules", "*-test", "lib", "index.d.ts"],
            filesGlob: ["./src/**/*.ts"],
            rootDirs: ["node_modules"]
        }, null, 2),
        ".gitignore": "\nnode_modules\n.DS_Store\nnpm-*\nlib\n*.d.ts\n",
        "./src/entry.ts": "\nimport * as ReactDOM from \"react-dom\";\nimport * as React from \"react\";\nimport { Application } from \"./components/main/view.pc\";\n\nconst mount = document.createElement(\"div\");\ndocument.body.appendChild(mount);\n\nReactDOM.render(React.createElement(Application), mount);\n",
        "./src/components/main/view.pc": JSON.stringify((0, paperclip_1.createPCModule)([mainComponent]), null, 2),
        "./src/components/main/controller.tsx": "" +
            "import * as React from \"react\";\nimport {BaseApplicationProps} from \"./view.pc\"\n\nexport type Props = {\n\n} & BaseApplicationProps;\n\nexport default (Base: React.ComponentClass<BaseApplicationProps>) => class ApplicationController extends React.PureComponent<Props> {\n  render() {\n    const {...rest} = this.props;\n    return <Base {...rest} />;\n  }\n}\n\n",
        "src/index.html": "<!DOCTYPE html>\n  <html>\n  <head>\n    <style>\n      body, html {\n        margin: 0;\n        padding: 0;\n      }\n    </style>\n  </head>\n  <body>\n  </body>\n  </html>",
        "webpack.config.js": "" +
            "\nconst {resolve} = require(\"path\");\nconst webpack   = require(\"webpack\");\nconst fs = require(\"fs\");\nconst HtmlWebpackPlugin = require(\"html-webpack-plugin\");\n\n\nmodule.exports = {\n  devtool: \"none\",\n  mode: \"development\",\n  entry: {\n    index: [__dirname + \"/src/entry.ts\"]\n  },\n  output: {\n    path: resolve(__dirname, \"lib\"),\n    filename: \"[name].bundle.js\"\n  },\n  resolve: {\n    extensions: [\".js\", \".ts\", \".tsx\"],\n    modules: [\n      resolve(__dirname, \"node_modules\")\n    ]\n  },\n  plugins: [\n    new HtmlWebpackPlugin({\n      template: __dirname + \"/src/index.html\"\n    })\n  ],\n  module: {\n    rules: [\n      { test: /.pc$/, use: [{\n          loader: \"paperclip-react-loader\",\n          options: {\n            config: JSON.parse(fs.readFileSync(\"./app.tdproject\", \"utf8\"))\n          }\n        }]\n      },\n      {\n        test: /.tsx?$/,\n        use: [\"ts-loader\"]\n      }\n    ]\n  }\n};\n"
    };
};
exports.createFiles = createFiles;
//# sourceMappingURL=index.js.map