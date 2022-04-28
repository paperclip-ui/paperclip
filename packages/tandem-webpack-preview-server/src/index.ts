import * as express from "express";
import { merge } from "lodash";
import * as webpack from "webpack";
import * as MultiEntryPlugin from "webpack/lib/MultiEntryPlugin";
import * as webpackDevMiddleware from "webpack-dev-middleware";
import * as webpackHotMiddleware from "webpack-hot-middleware";
import * as crypto from "crypto";

// for info, see:
// https://github.com/webpack/webpack/issues/1422

const WEBPACK_HOT_CLIENT_PATH = require.resolve(
  "webpack-hot-middleware/client"
);

export type TandemWebpackPluginOptions = {
  includeScripts?: string[];
  port: number;
  config: webpack.Configuration;
};

class TandemWebpackPreviewPlugin {
  private _entries: {
    [identifier: string]: boolean;
  };

  private _server: express.Express;
  private _compiler: webpack.Compiler;
  private _devMiddleware: webpackDevMiddleware.WebpackDevMiddleware;
  readonly options: TandemWebpackPluginOptions;

  constructor(options: TandemWebpackPluginOptions) {
    this.options = options;
    this._entries = {};
  }

  start() {
    this._compiler = webpack(this.options.config);
    this._server = express();
    this._server.use(
      (this._devMiddleware = webpackDevMiddleware(this._compiler, {
        publicPath: `/`
      }))
    );
    this._server.use(
      webpackHotMiddleware(this._compiler, {
        reload: true
      })
    );
    this._addRoutes();
    this._server.listen(this.options.port);
    console.info(`Started dev server on port %d`, this.options.port);
  }

  // apply(compiler: webpack.Compiler) {
  //   this._compiler = compiler;
  // }

  async compileEntry(filePath: string) {
    return new Promise(resolve => {
      if (!this._entries[filePath]) {
        this._entries[filePath] = true;
        new MultiEntryPlugin(
          this._compiler.options.context,
          [WEBPACK_HOT_CLIENT_PATH, filePath],
          getFilePathHash(filePath)
        ).apply(this._compiler);
        this._devMiddleware.invalidate(resolve);
      } else {
        resolve();
      }
    });
  }

  _addRoutes() {
    (this.options.includeScripts || []).forEach(scriptPath => {
      this._server.get(
        `/scripts/${getFilePathHash(scriptPath)}.js`,
        (req, res) => {
          res.sendFile(scriptPath);
        }
      );
    });

    this._server.get(`/preview.html`, async (req, res) => {
      try {
        const hash = getFilePathHash(req.query.entryPath);
        await this.compileEntry(req.query.entryPath);
        res.send(`
          <html>
            <head>
              ${(this.options.includeScripts || [])
                .map(scriptPath => {
                  return `<script type="text/javascript" src="/scripts/${getFilePathHash(
                    scriptPath
                  )}.js"></script>`;
                })
                .join("\n")}

              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                }
              </style>
              </head>
              <body>
              </body>
              <script>
                var _ENTRY_COMPONENT_ID = "${req.query.contentNodeId}";
              </script>
              <script type="text/javascript" src="/${hash}.js"></script>
          </html>
        `);
      } catch (e) {
        res.send(e);
      }
    });
  }
}

const getFilePathHash = (filePath: string) =>
  crypto
    .createHash("md5")
    .update(filePath)
    .digest("hex");

module.exports = TandemWebpackPreviewPlugin;
