import { TextEdit } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DesignerClient } from "./designer-client";

export class DocumentManager {
  private _documents: Record<string, TextDocument>;
  constructor(private _designerClient: DesignerClient) {
    this._documents = {};
  }
  getDocument(uri: string) {
    return this._documents[uri];
  }
  updateDocument(uri: string, document: TextDocument) {
    const exists = this._documents[uri] != null;
    this._documents[uri] = document;
    this._designerClient.updateVirtualFileContent(uri, document.getText());
  }
  async appleDocumentEdits(uri: string, edits: TextEdit[]) {
    const text = TextDocument.applyEdits(this._documents[uri], edits);
    await this._designerClient.updateVirtualFileContent(uri, text);
  }
  removeDocument(uri: string) {
    delete this._documents[uri];
  }
}
