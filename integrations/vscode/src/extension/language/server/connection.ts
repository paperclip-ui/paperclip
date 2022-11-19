import {
  Connection,
  TextDocumentSyncKind,
  InitializeParams,
  WorkspaceFolder,
  DidChangeTextDocumentParams,
  DidOpenTextDocumentParams,
  DidCloseTextDocumentParams,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DocumentManager } from "./documents";
import { EventEmitter } from "stream";
import { DesignerClient } from "./designer-client";
import { EVENTS_NOTIFICATION_NAME } from "../constants";
import { ServerEvent, serverEvents } from "./events";
import { FileChanged } from "@paperclip-ui/proto/lib/generated/service/designer";

// TODO - need better SRP here, this class is doing too much
export class PaperclipLanguageServerConnectionManager {
  private _workspaceFolders: WorkspaceFolder[];
  private _em: EventEmitter;

  constructor(
    private _designerClient: DesignerClient,
    private _connection: Connection,
    private _documents: DocumentManager,
    readonly config: any
  ) {
    this._em = new EventEmitter();
  }
  activate() {
    this._connection.onInitialize(this._onConnectionInitialize);
    this._connection.onInitialized(this._onConnectionInitialized);
    this._connection.onDidOpenTextDocument(this._onDidOpenTextDocument);
    this._connection.onDidCloseTextDocument(this._onDidCloseTextDocument);
    this._connection.onDidChangeTextDocument(this._onDidChangeTextDocument);
    this._connection.listen();
    this._designerClient.ready().then(this._onDesignerConnected);
    this._designerClient.onFileChange(this._onDesignerFileChanged);
  }

  onInitialize(listener: (details: { workspaceFolders: string[] }) => void) {
    return this._em.once("init", listener);
  }

  private _onDesignerConnected = () => {
    this._dispatch(
      serverEvents.started({ port: this._designerClient.getPort() })
    );
  };

  private _dispatch(event: ServerEvent) {
    this._connection.sendNotification(EVENTS_NOTIFICATION_NAME, event);
  }
  private _onDesignerFileChanged = (data: FileChanged) => {
    this._dispatch(
      serverEvents.fileChanged({
        path: data.path,
        content: new TextDecoder().decode(data.content),
      })
    );
  };
  private _onDidOpenTextDocument = ({
    textDocument,
  }: DidOpenTextDocumentParams) => {
    const uri = textDocument.uri;
    this._documents.updateDocument(
      uri,
      TextDocument.create(
        uri,
        textDocument.languageId,
        textDocument.version,
        textDocument.text
      )
    );
  };

  private _onDidCloseTextDocument = ({
    textDocument,
  }: DidCloseTextDocumentParams) => {
    const uri = textDocument.uri;
    this._documents.removeDocument(uri);
  };

  private _onDidChangeTextDocument = ({
    contentChanges,
    textDocument,
  }: DidChangeTextDocumentParams) => {
    const uri = textDocument.uri;

    const oldDocument = this._documents.getDocument(uri);

    const newDocument = TextDocument.update(
      oldDocument,
      contentChanges,
      oldDocument.version + 1
    );

    this._documents.updateDocument(uri, newDocument);
  };

  private _onConnectionInitialize = (params: InitializeParams) => {
    this._workspaceFolders = params.workspaceFolders || [];

    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental as any,
        // completionProvider: {
        //   resolveProvider: true,
        //   triggerCharacters: [".", "<", '"', "'", "{", ":", " ", "(", ">", "$"],
        // },
        // documentLinkProvider: {
        //   resolveProvider: true,
        // },
        colorProvider: true,
        // definitionProvider: true,
      },
    };
  };

  private _onConnectionInitialized = async () => {
    this._em.emit("init", { workspaceFolders: this._workspaceFolders });
  };
}
