import { DocumentManager } from "./documents";
import { DOMFactory } from "@paperclip-ui/web-renderer/lib/base";
import { RPCClientAdapter } from "@paperclip-lang/common";

export type EditorClientOptions = {};

export class EditorClient {
  private _documents: DocumentManager;

  /**
   */

  constructor(private _connection: RPCClientAdapter) {
    this._documents = new DocumentManager(this._connection);
  }

  /**
   */

  getDocuments() {
    return this._documents;
  }
}
