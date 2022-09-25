// TODO: need to simplify event flow because it's a cluster F
import { createConnection, ProposedFeatures } from "vscode-languageserver/node";

import { DesignerClient } from "./designer-client";
import { DocumentManager } from "./documents";
import { PaperclipLanguageServerConnectionManager } from "./connection";

export class PaperclipLanguageServer {
  constructor() {
    const connection = createConnection(ProposedFeatures.all);
    const designerClient = new DesignerClient();
    const documents = new DocumentManager(designerClient);

    const connectionManager = new PaperclipLanguageServerConnectionManager(
      connection,
      documents,
      {}
    );

    // new LanguageRequestResolver(designServer, connection, documents);

    connectionManager.activate();

    // connectionManager.onInitialize((info) => {
    //   designerClient.start(info);
    // });
  }
}
console.log("DO");

const server = new PaperclipLanguageServer();
