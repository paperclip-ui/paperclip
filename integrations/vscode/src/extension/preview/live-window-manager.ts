import { Deferred } from "@paperclip-ui/common";
import { WebviewPanel, window } from "vscode";
// import { LiveWindow, LiveWindowState } from "./live-window";
import { PaperclipLanguageClient, ReadyInfo } from "../language/client";
import { LiveWindow, openExternalWindow } from "./live-window";

export class LiveWindowManager {
  // private _windows: LiveWindow[];
  private _hasOpenedWindow: boolean = false;
  private _devServerPort: Deferred<number> = new Deferred();
  constructor(private _languageClient: PaperclipLanguageClient) {
    // this._windows = [];
    this._languageClient.onReady(this._onDevServerStarted);
  }
  hasOpenedWindow() {
    return this._hasOpenedWindow;
  }
  _onDevServerStarted = ({ port }: ReadyInfo) => {
    this._devServerPort.resolve(port);
    // for (const window of this._windows) {
    //   window.setDevServerInfo(port);
    // }
  };
  async open(uri: string, _sticky: boolean) {
    this._hasOpenedWindow = true;
    await openExternalWindow(uri, await this._devServerPort.promise);
    // const liveWindow = LiveWindow.newFromUri(uri, sticky, this._devServerPort);
    // this._add(liveWindow);
  }
  // private _add(window: LiveWindow) {
  //   this._windows.push(window);
  //   window.onDispose(() => {
  //     this._windows.splice(this._windows.indexOf(window), 1);
  //   });
  // }
  activate() {
    // window.registerWebviewPanelSerializer(LiveWindow.TYPE, {
    //   deserializeWebviewPanel: async (
    //     panel: WebviewPanel,
    //     state: LiveWindowState
    //   ) => {
    //     this._add(LiveWindow.newFromPanel(panel, state, this._devServerPort));
    //   },
    // });
  }
}
