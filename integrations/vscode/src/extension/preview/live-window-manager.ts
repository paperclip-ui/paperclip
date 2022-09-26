import { WebviewPanel, window } from "vscode";
import { LiveWindow, LiveWindowState } from "./live-window";
import { isPaperclipFile } from "@paperclip-ui/common";
import { PaperclipLanguageClient, ReadyInfo } from "../language/client";

export class LiveWindowManager {
  private _windows: LiveWindow[];
  private _devServerPort: number;
  constructor(private _languageClient: PaperclipLanguageClient) {
    this._windows = [];
    this._languageClient.onReady(this._onDevServerStarted);
  }
  _onDevServerStarted = ({ port }: ReadyInfo) => {
    this._devServerPort = port;
    for (const window of this._windows) {
      window.setDevServerInfo(port);
    }
  };
  getLength() {
    return this._windows.length;
  }
  setStickyWindowUri(uri: string) {
    const stickyWindow = this._windows.find(
      (window) => window.getState().sticky
    );
    if (stickyWindow && isPaperclipFile(uri)) {
      stickyWindow.setTargetUri(uri);
      return true;
    }
    return false;
  }
  open(uri: string, sticky: boolean) {
    const liveWindow = LiveWindow.newFromUri(uri, sticky, this._devServerPort);
    this._add(liveWindow);
  }
  private _add(window: LiveWindow) {
    this._windows.push(window);
    window.onDispose(() => {
      this._windows.splice(this._windows.indexOf(window), 1);
    });
  }
  activate() {
    window.registerWebviewPanelSerializer(LiveWindow.TYPE, {
      deserializeWebviewPanel: async (
        panel: WebviewPanel,
        state: LiveWindowState
      ) => {
        this._add(LiveWindow.newFromPanel(panel, state, this._devServerPort));
      },
    });
  }
}
