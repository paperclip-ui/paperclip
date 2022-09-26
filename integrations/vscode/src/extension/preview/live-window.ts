import { window, WebviewPanel, ViewColumn, env, Uri } from "vscode";
import * as path from "path";
import { ObservableMap, Store } from "@paperclip-ui/common";
import { EventEmitter } from "events";
import * as qs from "querystring";
import produce from "immer";
import * as url from "url";

interface LiveWindowLocation {
  pathname: string;
  query: Partial<{
    file: string;
  }>;
}

export interface LiveWindowState {
  location: LiveWindowLocation;
  sticky: boolean;
  panelVisible?: boolean;
}

export class LiveWindow {
  static TYPE = "@paperclip-ui/preview";
  private _store: ObservableMap<LiveWindowState>;
  private _em: EventEmitter;

  constructor(
    state: LiveWindowState,
    private _devServerPort: number,
    private _panel: WebviewPanel
  ) {
    this._store = new ObservableMap({
      ...state,
      embedded: true,
      panelVisible: this._panel.visible,
    });

    this._store.onChange(this._onStoreChange);
    this._em = new EventEmitter();
    this._panel.onDidDispose(this._onPanelDispose);
    this._createBindings();
    this._render();
  }

  getState() {
    return this._store.getState();
  }

  dispose() {
    try {
      this._panel.dispose();

      // eslint-disable-next-line
    } catch (e) {}
    this._em.emit("dispose");
  }

  onDispose(listener: () => void) {
    this._em.once("dispose", listener);
  }

  /**
   * Need to make this accessble in case language server respawns
   * TODO - probably need to change to be event based instead.
   */

  setDevServerInfo(port: number) {
    this._devServerPort = port;
    this._render();
  }

  setTargetUri(uri: string) {
    this._store.update((state) =>
      produce(state, (newState) => {
        state.location.query.file = url.fileURLToPath(uri);
      })
    );
  }

  private _onPanelDispose = () => {
    this.dispose();
  };

  private _onStoreChange = (
    newState: LiveWindowState,
    oldState: LiveWindowState
  ) => {
    // if coming into visibility again
    if (
      (newState.panelVisible &&
        newState.panelVisible !== oldState.panelVisible) ||
      newState.location.query.file !== oldState.location.query.file
    ) {
      this._render();
    }
  };

  private async _render() {
    const state = this.getState();

    this._panel.title = `⚡️ ${
      state.sticky
        ? "sticky preview"
        : state.location.query.file && path.basename(state.location.query.file)
    }`;

    this._panel.webview.html = "";
    this._panel.webview.html = await this._getHTML();
  }

  private async _getHTML() {
    const state = this.getState();

    // For Codespace
    const designerHost = await env.asExternalUri(
      Uri.parse(`http://localhost:${this._devServerPort}`)
    );

    console.log(`Opening preview: ${designerHost}`);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        html, body { 
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }
        body {
          /* ensure that bg is white, even for themes */
          background: white;
          margin: 0;
        }
        #app {
          width: 100vw;
          height: 100vh;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .loader {
          width:12px;
          height:12px;
          background: #000000;
          opacity: 0.3;
          border-radius: 50%;
          box-shadow: 20px 0 #00000022,-20px 0 #000000;
          animation: loader 1s infinite linear alternate;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
        }
        @keyframes loader {
            0% {box-shadow: 20px 0 #000000,-20px 0 #00000022;background: #000000}
            33%{box-shadow: 20px 0 #000000,-20px 0 #00000022;background: #00000022}
            66%{box-shadow: 20px 0 #00000022,-20px 0 #000000;background: #00000022}
        }

      </style>

      <script>
        const defaultStyles = document.getElementById("_defaultStyles");
        if (defaultStyles) {
          defaultStyles.remove();
        }
        const vscode = acquireVsCodeApi();
        const initialState = ${JSON.stringify(state)};
        vscode.setState(initialState);

      </script>
    </head>
    <body>
      <div class="loader"></div>
    </body>
    <script>
      const iframe = document.createElement("iframe");
      iframe.src = "${designerHost}?${qs.stringify(state.location.query)}";
      Object.assign(iframe.style, {
        width: "100vw",
        height: "100wh",
        border: "none",
        background: "transparent",
        position: "absolute",
        top: 0,
        left: 0
      });
      iframe.onload = () => document.getElementById("loader").remove();
      document.body.appendChild(iframe);
    </script>
    </html>`;
  }

  private _createBindings() {
    this._panel.onDidChangeViewState(() => {
      this._store.update((state) =>
        produce(state, (state) => {
          state.panelVisible = this._panel.visible;
        })
      );
    });
  }

  static newFromUri(uri: string, sticky: boolean, devServerPort: number) {
    const panel = window.createWebviewPanel(
      LiveWindow.TYPE,
      sticky ? "sticky preview" : `⚡️ ${path.basename(uri)}`,
      ViewColumn.Beside,
      {
        enableScripts: true,
      }
    );

    return new LiveWindow(
      { location: getLocationFromUri(uri), sticky },
      devServerPort,
      panel
    );
  }

  static newFromPanel(
    panel: WebviewPanel,
    state: LiveWindowState,
    devServerPort: number
  ) {
    return new LiveWindow(state, devServerPort, panel);
  }
}

const getLocationFromUri = (uri: string): LiveWindowLocation => ({
  pathname: "/",
  query: {
    file: url.fileURLToPath(uri),
  },
});
