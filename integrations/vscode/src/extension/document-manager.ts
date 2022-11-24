import { LiveWindowManager } from "./preview/live-window-manager";
import {
  Selection,
  TextEdit,
  TextEditor,
  Range,
  TextDocumentChangeEvent,
  ViewColumn,
  window,
  workspace,
  TextDocument,
  WorkspaceEdit,
  Uri,
  TextDocumentChangeReason,
} from "vscode";
import * as vscode from "vscode";
import { fixFileUrlCasing } from "./utils";
import * as ws from "ws";
import { PaperclipLanguageClient } from "./language/client";
import { isPaperclipFile } from "@paperclip-ui/common";
import { LanguageClient } from "vscode-languageclient/node";
import { FileChanged } from "@paperclip-ui/proto/lib/generated/service/designer";
import { pathToFileURL, URL } from "url";
import { serverEvents } from "./language/server/events";

enum OpenLivePreviewOptions {
  Yes = "Yes",
  Always = "Always",
  No = "No",
}

// TODO: need to simplify this class a bit, it's doing too many things
export class DocumentManager {
  private _showedOpenLivePreviewPrompt: boolean;

  constructor(
    private _windows: LiveWindowManager,
    private _client: PaperclipLanguageClient
  ) {
    console.log("DocumentManager::constructor");
    this._client.onFileChanged(this._onFileChanged);
  }

  activate() {
    window.onDidChangeActiveTextEditor(this._onActiveTextEditorChange);
    if (window.activeTextEditor) {
      this._onActiveTextEditorChange(window.activeTextEditor);
    }
  }

  private _onFileChanged = async (
    event: ReturnType<typeof serverEvents.fileChanged>["payload"]
  ) => {
    const content = event.content;
    const textDocument = await vscode.workspace.openTextDocument(event.path);
    if (textDocument.getText() === content) {
      return;
    }
    const editor = await vscode.window.activeTextEditor.edit((builder) => {
      builder.replace(
        new vscode.Range(
          textDocument.positionAt(0),
          textDocument.positionAt(textDocument.getText().length)
        ),
        content
      );
    });
    vscode.window.activeTextEditor.selection = new vscode.Selection(
      vscode.window.activeTextEditor.selection.end,
      vscode.window.activeTextEditor.selection.end
    );
  };

  private _onActiveTextEditorChange = (editor: TextEditor) => {
    if (!editor) {
      return;
    }
    const uri = fixFileUrlCasing(String(editor.document.uri));

    if (!this._windows.hasOpenedWindow() && isPaperclipFile(uri)) {
      this._askToDisplayLivePreview(uri);
    }
  };

  private _askToDisplayLivePreview = async (uri: string) => {
    if (this._showedOpenLivePreviewPrompt) {
      return false;
    }

    this._showedOpenLivePreviewPrompt = true;

    const option = await window.showInformationMessage(
      `Would you like to open a live preview? Command: "Paperclip: Open Live Preview" is also available. `,
      OpenLivePreviewOptions.Always,
      OpenLivePreviewOptions.Yes,
      OpenLivePreviewOptions.No
    );

    if (option === OpenLivePreviewOptions.Yes) {
      this._windows.open(uri, false);
    } else if (option === OpenLivePreviewOptions.Always) {
      this._windows.open(uri, true);
    }
  };
}
