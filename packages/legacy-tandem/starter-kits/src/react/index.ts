import { ProjectTemplate, ProjectFileCreator } from "../state";
import {
  createPCModule,
  createPCComponent,
  createPCTextNode,
  PCVisibleNodeMetadataKey,
} from "@paperclip-lang/core";
import { createBounds } from "tandem-common";

export const template: ProjectTemplate = {
  id: "react",
  icon: null,
  label: "React",
  description: "TypeScript + React + Webpack starter project.",
};

export type ReactProjectOptions = {
  packageName?: string;
};

export const createFiles: ProjectFileCreator = ({
  packageName = "my-app-name",
}: ReactProjectOptions) => {
  let mainComponent = createPCComponent(
    "Application",
    null,
    null,
    null,
    [createPCTextNode("App content")],
    {
      [PCVisibleNodeMetadataKey.BOUNDS]: createBounds(0, 600, 0, 400),
    }
  );

  mainComponent = {
    ...mainComponent,
    controllers: ["./controller.tsx"],
  };

  return {
    "package.json": JSON.stringify(
      {
        name: packageName,
        version: "1.0.0",
        description: "",
        main: "index.js",
        scripts: {
          test: 'echo "Error: no test specified" && exit 1',
          build:
            'paperclip-react-compiler "src/**/*.pc" --definition --write && webpack',
          "build:watch":
            'concurrently "paperclip-react-compiler \\"src/**/*.pc\\" --definition --write --watch" "webpack-dev-server --port=8080 --open"',
        },
        repository: {
          type: "git",
          url: "git+https://github.com/tandemcode/tandem-react-starter-kit.git",
        },
        author: "",
        license: "ISC",
        bugs: {
          url: "https://github.com/tandemcode/tandem-react-starter-kit/issues",
        },
        homepage:
          "https://github.com/tandemcode/tandem-react-starter-kit#readme",
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
          "webpack-dev-server": "3.x.x",
        },
        dependencies: {
          react: "^16.4.1",
          "react-dom": "^16.4.1",
        },
      },
      null,
      2
    ),
    "README.md": `

This is a basic starter project for React-based applications.

#### Installation

Start by running \`npm install\` or \`yarn install\` in terminal, then run \`npm run build\`. After that, open
lib/index.html.

#### Directory structure

\`\`\`
lib/ # the build directory
src/ # all source files
  components/ # all component files
  entry.js # main entry point into application
\`\`\`

#### Terminal commands

\`\`\`
npm run build # builds the project
npm run build:watch # builds & watches project for any changes
\`\`\`


`,
    "app.tdproject": JSON.stringify(
      {
        scripts: {
          // want to have an install here in case we're starting with a fresh project, OR there's an update.
          // may eventually want to change this to a start.sh script.
          build: "npm install && npm run build:watch",
          open: "open http://localhost:8080/",
        },
        rootDir: ".",
        exclude: ["node_modules"],
        mainFilePath: "./src/components/main/view.pc",
      },
      null,
      2
    ),
    "tsconfig.json": JSON.stringify(
      {
        compileOnSave: true,
        compilerOptions: {
          target: "es5",
          sourceMap: true,
          lib: ["es2015.promise", "dom", "es5", "esnext"],
          module: "commonjs",
          outDir: "lib",
          jsx: "react",
          baseUrl: "src",
          experimentalDecorators: true,
        },
        exclude: ["node_modules", "*-test", "lib", "index.d.ts"],
        filesGlob: ["./src/**/*.ts"],
        rootDirs: ["node_modules"],
      },
      null,
      2
    ),
    ".gitignore": `
node_modules
.DS_Store
npm-*
lib
*.d.ts
`,
    "./src/entry.ts": `
import * as ReactDOM from "react-dom";
import * as React from "react";
import { Application } from "./components/main/view.pc";

const mount = document.createElement("div");
document.body.appendChild(mount);

ReactDOM.render(React.createElement(Application), mount);
`,
    "./src/components/main/view.pc": JSON.stringify(
      createPCModule([mainComponent]),
      null,
      2
    ),
    "./src/components/main/controller.tsx":
      `` +
      `import * as React from "react";
import {BaseApplicationProps} from "./view.pc"

export type Props = {

} & BaseApplicationProps;

export default (Base: React.ComponentClass<BaseApplicationProps>) => class ApplicationController extends React.PureComponent<Props> {
  render() {
    const {...rest} = this.props;
    return <Base {...rest} />;
  }
}

`,
    "src/index.html": `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body, html {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
  </body>
  </html>`,
    "webpack.config.js":
      `` +
      `
const {resolve} = require("path");
const webpack   = require("webpack");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");


module.exports = {
  devtool: "none",
  mode: "development",
  entry: {
    index: [__dirname + "/src/entry.ts"]
  },
  output: {
    path: resolve(__dirname, "lib"),
    filename: "[name].bundle.js"
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: [
      resolve(__dirname, "node_modules")
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/src/index.html"
    })
  ],
  module: {
    rules: [
      { test: /\.pc$/, use: [{
          loader: "paperclip-react-loader",
          options: {
            config: JSON.parse(fs.readFileSync("./app.tdproject", "utf8"))
          }
        }]
      },
      {
        test: /\.tsx?$/,
        use: ["ts-loader"]
      }
    ]
  }
};
`,
  };
};
