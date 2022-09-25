import { ExtensionContext } from "vscode";
import { CommandManager } from "./command-manager";
import { DocumentManager } from "./document-manager";
import { PaperclipLanguageClient } from "./language/client";
import { LiveWindowManager } from "./preview/live-window-manager";

class PaperclipExtension {
  private _languageClient: PaperclipLanguageClient;
  private _windowManager: LiveWindowManager;
  private _documentManager: DocumentManager;
  private _commandManager: CommandManager;

  constructor(context: ExtensionContext) {
    this._languageClient = new PaperclipLanguageClient(context);
    this._windowManager = new LiveWindowManager(this._languageClient);
    this._commandManager = new CommandManager(this._windowManager);
    this._documentManager = new DocumentManager(this._windowManager);
  }
  activate() {
    this._languageClient.activate();
    this._windowManager.activate();
    this._commandManager.activate();
    this._documentManager.activate();
  }
  deactivate() {}
}

let _ext: PaperclipExtension;

export const activate = (context: ExtensionContext) => {
  _ext = new PaperclipExtension(context);
  _ext.activate();
};

export const deactivate = () => {
  _ext && _ext.deactivate();
};
